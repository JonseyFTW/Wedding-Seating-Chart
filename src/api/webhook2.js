import Stripe from 'stripe';
import { db } from '../src/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
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

      await updateDoc(doc(db, 'users', deletedFirebaseUID), {
        subscription: null,
      });
      break;
  }

  res.json({ received: true });
}