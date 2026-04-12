// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables for security
// Never commit actual API keys to version control
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAqg_zj0iM5zi6PuJvSqOEqM3UShzv_IfU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "noble-asset-vault.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "noble-asset-vault",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "noble-asset-vault.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "912440349670",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:912440349670:web:79535db14219885976bc27",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-EG87QM3YPE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
