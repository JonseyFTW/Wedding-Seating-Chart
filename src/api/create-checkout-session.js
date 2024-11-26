import Stripe from 'stripe';
import { db } from '../src/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK (only once)
if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error('Missing Firebase Admin credentials in environment variables.');
}

initializeApp({
  credential: cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  }),
});

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, idToken } = req.body;

    if (!priceId || !idToken) {
      return res.status(400).json({ error: 'Price ID and ID Token are required' });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    const userData = userDoc.data();

    let customerId = userData.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: decodedToken.email || userData.email,
        metadata: {
          firebaseUID: userId,
        },
      });

      customerId = customer.id;

      await updateDoc(doc(db, 'users', userId), {
        stripeCustomerId: customerId,
      });
    }

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

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
