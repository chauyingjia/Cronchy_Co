import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3K_EfN0x8j8BV57fDobDQSMuRQU2koV0",
  authDomain: "cronchyco.firebaseapp.com",
  projectId: "cronchyco",
  storageBucket: "cronchyco.firebasestorage.app",
  messagingSenderId: "495699556525",
  appId: "1:495699556525:web:345a5e5f464a855c6c6e24",
  measurementId: "G-ZFZ4NPN840"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});

export { app, analytics, db };
