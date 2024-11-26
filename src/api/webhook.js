import Stripe from 'stripe';
import { db } from '../../src/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const endpointSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body
  },
};

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => (data += chunk));
      req.on('end', () => resolve(Buffer.from(data)));
    });

    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (error) {
    console.error('Webhook Error:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      const subscription = event.data.object;
      const customer = await stripe.customers.retrieve(subscription.customer);
      const firebaseUID = customer.metadata.firebaseUID;

      await updateDoc(doc(db, 'users', firebaseUID), {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer);
      const deletedFirebaseUID = deletedCustomer.metadata.firebaseUID;

      await updateDoc(doc(db, 'users', deletedFirebaseUID), { subscription: null });
      break;
  }

  res.status(200).send({ received: true });
}
