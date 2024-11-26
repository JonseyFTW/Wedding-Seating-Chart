import React from 'react';
import { Crown, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { auth } from '../firebase'; // Import Firebase auth

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const PremiumModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSubscribe = async () => {
    try {
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe has not been initialized correctly.');
      }

      // Check if the user is authenticated
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to subscribe.');
      }

      // Get the Firebase ID Token
      const idToken = await user.getIdToken();

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
          idToken, // Pass the ID Token
        }),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to create checkout session. Please try again.'
        );
      }

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
      toast.error(error.message || 'An error occurred while subscribing.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <Crown className="w-12 h-12 text-[#D3A6B8] mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#4A3B52] mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-[#646E78]">
            Get access to our powerful AI Seating Planner and more premium features.
          </p>
        </div>

        <div className="bg-[#FDF8F0] rounded-lg p-4 mb-6">
          <h3 className="font-serif text-[#4A3B52] mb-3">Premium Features:</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-[#646E78]">
              <Crown className="w-4 h-4 text-[#D3A6B8]" />
              AI-powered seating optimization
            </li>
            <li className="flex items-center gap-2 text-[#646E78]">
              <Crown className="w-4 h-4 text-[#D3A6B8]" />
              Relationship mapping
            </li>
            <li className="flex items-center gap-2 text-[#646E78]">
              <Crown className="w-4 h-4 text-[#D3A6B8]" />
              Guest conflict management
            </li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-serif text-[#4A3B52] mb-2">
            $5<span className="text-lg text-[#646E78]">/month</span>
          </div>
          <p className="text-sm text-[#646E78]">Cancel anytime.</p>
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full bg-[#D3A6B8] text-white py-3 px-6 rounded-lg hover:bg-[#C295A7] transition-colors flex items-center justify-center gap-2 font-serif"
        >
          <Crown className="w-5 h-5" />
          Upgrade Now
        </button>
      </div>
    </div>
  );
};
