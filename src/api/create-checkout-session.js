import Stripe from 'stripe';
import { auth, db } from '../src/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase-admin/auth';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, idToken } = req.body;

    // Ensure priceId and idToken are provided
    if (!priceId || !idToken) {
      return res.status(400).json({ error: 'Price ID and ID Token are required' });
    }

    // Verify the ID Token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Fetch user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const userData = userDoc.data();

    // Check if user already has a Stripe customer ID
    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: decodedToken.email,
        metadata: {
          firebaseUID: userId,
        },
      });

      customerId = customer.id;

      // Save the customer ID to Firestore
      await updateDoc(doc(db, 'users', userId), {
        stripeCustomerId: customerId,
      });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/subscription-canceled`,
    });

    // Respond with the session ID
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
