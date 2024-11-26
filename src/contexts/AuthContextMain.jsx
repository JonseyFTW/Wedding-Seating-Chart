import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user's subscription status
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setSubscription(doc.data().subscription || null);
          }
        });
        setCurrentUser(user);
        return () => unsubscribeSnapshot();
      } else {
        setCurrentUser(null);
        setSubscription(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email, password, firstName, lastName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        createdAt: new Date().toISOString(),
        subscription: null
      });
      
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Failed to create account');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error('Failed to log in');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Check if user document exists, if not create it
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const names = user.displayName?.split(' ') || ['', ''];
        await setDoc(userRef, {
          email: user.email,
          firstName: names[0],
          lastName: names[1],
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          subscription: null
        });
      }
      
      toast.success('Logged in with Google successfully!');
    } catch (error) {
      toast.error('Failed to log in with Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Failed to log out');
      throw error;
    }
  };

  const value = {
    currentUser,
    subscription,
    signup,
    login,
    loginWithGoogle,
    logout,
    loading,
    isPremium: subscription?.status === 'active'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};