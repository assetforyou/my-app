// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAqg_zj0iM5zi6PuJvSqOEqM3UShzv_IfU",
    authDomain: "noble-asset-vault.firebaseapp.com",
    projectId: "noble-asset-vault",
    storageBucket: "noble-asset-vault.appspot.com",
    messagingSenderId: "912440349670",
    appId: "1:912440349670:web:79535db14219885976bc27",
    measurementId: "G-EG87QM3YPE"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
