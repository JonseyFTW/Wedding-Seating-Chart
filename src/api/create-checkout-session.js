import Stripe from 'stripe';
import { db } from '../../src/firebase'; // Ensure this points to your Firebase config
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { priceId, idToken } = req.body;

    // Validate Firebase Auth ID Token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Check if user exists in Firestore
    const userRef = doc(db, 'users', userId);
    const userData = (await getDoc(userRef)).data();

    if (!userData) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    // Create a Stripe customer if one doesn't exist
    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: { firebaseUID: userId },
      });

      customerId = customer.id;
      await updateDoc(userRef, { stripeCustomerId: customerId });
    }

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
}
