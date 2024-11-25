import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDJ1mglZbvNmEidkpV4kFpDaZLVu1BS7rY",
  authDomain: "seatyourguests.firebaseapp.com",
  projectId: "seatyourguests",
  storageBucket: "seatyourguests.firebasestorage.app",
  messagingSenderId: "739655576234",
  appId: "1:739655576234:web:08496aefeabe5c94537ed3",
  measurementId: "G-M7LHLJ9NGK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);