// Updated AuthModal.jsx
import React, { useState } from 'react';

export const AuthModal = ({ isOpen, onClose = () => {} }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { signup, login, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, firstName, lastName);
      }
      onClose(); // Ensure onClose is called after successful login/signup
    } catch (error) {
      console.error('Authentication Error:', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose(); // Close modal after successful Google login
    } catch (error) {
      console.error('Google Login Error:', error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal Content */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#4A3B52] hover:text-[#646E78]"
        >
          <X size={24} />
        </button>
        {/* Login/Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Fields for Signup */}
              <div>
                <label className="block text-sm font-medium text-[#4A3B52]">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A3B52]">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm"
                  required
                />
              </div>
            </>
          )}
          {/* Email and Password Fields */}
          <div>
            <label className="block text-sm font-medium text-[#4A3B52]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A3B52]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm"
              required
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#D3A6B8] text-white py-2 px-4 rounded-md hover:bg-[#C295A7]"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        {/* Google Login */}
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-[#D3A6B8]/20 text-[#4A3B52] py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Continue with Google
          </button>
        </div>
        {/* Switch Between Login/Signup */}
        <p className="mt-4 text-center text-sm text-[#4A3B52]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#D3A6B8] hover:text-[#C295A7]"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

