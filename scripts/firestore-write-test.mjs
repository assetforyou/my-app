/**
 * Round-trip test: sign in → write loan doc → read → delete.
 * Requires real Firebase Auth user (same project as the app).
 *
 * Usage:
 *   TEST_FIREBASE_EMAIL=you@example.com TEST_FIREBASE_PASSWORD='yourpass' node scripts/firestore-write-test.mjs
 *
 * Or add those two variables to `.env` in the project root, then:
 *   npm run test:firestore
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const firebaseConfig = {
  apiKey: 'AIzaSyAqg_zj0iM5zi6PuJvSqOEqM3UShzv_IfU',
  authDomain: 'noble-asset-vault.firebaseapp.com',
  projectId: 'noble-asset-vault',
  storageBucket: 'noble-asset-vault.appspot.com',
  messagingSenderId: '912440349670',
  appId: '1:912440349670:web:79535db14219885976bc27',
  measurementId: 'G-EG87QM3YPE',
};

const email = process.env.TEST_FIREBASE_EMAIL;
const password = process.env.TEST_FIREBASE_PASSWORD;

if (!email || !password) {
  console.log(`
[firestore-write-test] SKIPPED — no credentials.

To run a live Firestore test (writes then deletes one loan doc):
  export TEST_FIREBASE_EMAIL='your-login-email'
  export TEST_FIREBASE_PASSWORD='your-password'
  npm run test:firestore

Or add TEST_FIREBASE_EMAIL and TEST_FIREBASE_PASSWORD to .env
`);
  process.exit(0);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

try {
  console.log('[firestore-write-test] Signing in…');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userEmail = cred.user.email;
  if (!userEmail) {
    throw new Error('Signed-in user has no email (rules expect userEmail on documents).');
  }

  const colRef = collection(db, 'loans');
  const newRef = doc(colRef);
  const payload = {
    id: newRef.id,
    userEmail,
    type: 'Smoke test (safe to delete)',
    loanValue: 1,
    currency: 'USD',
    repaymentPerMonth: 0,
    purchaseYear: String(new Date().getFullYear()),
  };

  console.log('[firestore-write-test] Writing loans/', newRef.id, '…');
  await setDoc(newRef, payload);

  const snap = await getDoc(newRef);
  if (!snap.exists()) throw new Error('Document missing after write');
  const read = snap.data();
  if (read.userEmail !== userEmail) throw new Error('userEmail mismatch after read');
  if (read.loanValue !== 1) throw new Error('loanValue mismatch after read');

  console.log('[firestore-write-test] Read OK. Deleting test document…');
  await deleteDoc(newRef);

  console.log('[firestore-write-test] PASS — write, read, and delete succeeded.');
  process.exit(0);
} catch (err) {
  console.error('[firestore-write-test] FAIL:', err.message || err);
  process.exit(1);
}
