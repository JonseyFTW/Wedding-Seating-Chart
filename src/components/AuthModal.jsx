import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
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
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#4A3B52] hover:text-[#646E78]"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-[#4A3B52]">
          {isLogin ? 'Login' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#4A3B52]">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4A3B52]">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-[#4A3B52]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A3B52]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-[#D3A6B8]/20 shadow-sm focus:border-[#D3A6B8] focus:ring focus:ring-[#D3A6B8]/20"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D3A6B8] text-white py-2 px-4 rounded-md hover:bg-[#C295A7] transition-colors"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={() => loginWithGoogle()}
            className="w-full bg-white border border-[#D3A6B8]/20 text-[#4A3B52] py-2 px-4 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>
        </div>

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