import { auth, db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { getDoc } from 'firebase/firestore';
import { getDocs as getDocsAll } from 'firebase/firestore';

/**
 * Top-level Firestore collections (matches existing database layout).
 */
const TABLE_MAP = {
  Autos: 'autos',
  Cash: 'cash',
  Stocks: 'stocks',
  Metals: 'metals',
  Properties: 'properties',
  Loans: 'loans',
  Crypto: 'crypto',
  CustomAssets: 'customAssets',
  CustomAssetItems: 'customAssetItems',
  Savings: 'savings',
  Retirement: 'retirement',
  Bonds: 'bonds',
  Commodities: 'commodities',
  ArtCollectibles: 'artCollectibles',
  LuxuryWatches: 'luxuryWatches',
  PrivateEquity: 'privateEquity',
  IntellectualProperty: 'intellectualProperty'
};

function requireUser() {
  const u = auth.currentUser;
  if (!u?.email) {
    throw new Error('You must be signed in with an email account to access your portfolio.');
  }
  return { uid: u.uid, email: u.email };
}

function matchesAssetId(docSnap, assetId) {
  const data = docSnap.data();
  const fieldId = data?.id;
  return String(docSnap.id) === String(assetId) || String(fieldId) === String(assetId);
}

async function listUserDocs(collectionName, userEmail) {
  const q = query(collection(db, collectionName), where('userEmail', '==', userEmail));
  const snap = await getDocs(q);
  return snap.docs;
}

async function findUserDocsForId(collectionName, userEmail, assetId) {
  const docs = await listUserDocs(collectionName, userEmail);
  return docs.filter((d) => matchesAssetId(d, assetId));
}

const FirestoreAssetService = {
  fetchAssetById: async (tableName, assetId) => {
    const { email } = requireUser();
    const sub = TABLE_MAP[tableName];
    if (!sub) return null;
    const docs = await listUserDocs(sub, email);
    const match = docs.find((d) => matchesAssetId(d, assetId));
    if (!match) return null;
    const data = match.data();
    return { ...data, id: data.id ?? match.id };
  },

  fetchAssetItems: async (tableName, assetId) => {
    const { email } = requireUser();
    if (tableName !== 'CustomAssetItems') {
      throw new Error(`fetchAssetItems not supported for ${tableName}`);
    }
    const col = TABLE_MAP.CustomAssetItems;
    const q = query(
      collection(db, col),
      where('userEmail', '==', email),
      where('assetId', '==', String(assetId))
    );
    const result = await getDocs(q);
    return result.docs.map((d) => {
      const data = d.data();
      return { ...data, id: data.id ?? d.id };
    });
  },

  addAssetItem: async (tableName, item) => {
    const { email } = requireUser();
    if (tableName !== 'CustomAssetItems') {
      throw new Error(`addAssetItem not supported for ${tableName}`);
    }
    const colRef = collection(db, TABLE_MAP.CustomAssetItems);
    const newRef = doc(colRef);
    const { id: _clientItemId, userEmail: _ue, assetId: _aid, ...rest } = item;
    const payload = {
      ...rest,
      id: newRef.id,
      userEmail: item.userEmail || email,
      assetId: item.assetId != null ? String(item.assetId) : '',
    };
    await setDoc(newRef, payload);
    return payload;
  },

  /**
   * Creates a document with a Firestore auto-generated ID (same style as existing console data).
   */
  addAsset: async (tableName, asset) => {
    const { email } = requireUser();
    const sub = TABLE_MAP[tableName];
    if (!sub) throw new Error(`Unknown collection: ${tableName}`);
    const colRef = collection(db, sub);
    const newRef = doc(colRef);
    const userEmail = asset.userEmail || email;
    const { id: _clientId, userEmail: _u, ...rest } = asset;
    const payload = {
      ...rest,
      id: newRef.id,
      userEmail,
      scope: asset.scope === 'business' ? 'business' : 'personal',
    };
    await setDoc(newRef, payload);
    return payload;
  },

  updateAsset: async (tableName, assetId, updates) => {
    const { email } = requireUser();
    const sub = TABLE_MAP[tableName];
    if (!sub) return undefined;
    const cleaned = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(cleaned).length === 0) return cleaned;

    const matches = await findUserDocsForId(sub, email, assetId);
    if (matches.length === 0) return undefined;
    await updateDoc(matches[0].ref, cleaned);
    return cleaned;
  },

  deleteAsset: async (tableName, assetId, userEmail) => {
    const email = userEmail ?? requireUser().email;
    const sub = TABLE_MAP[tableName];
    if (!sub) return false;
    const matches = await findUserDocsForId(sub, email, assetId);
    if (!matches.length) return false;
    await Promise.all(matches.map((d) => deleteDoc(d.ref)));
    return true;
  },

  deleteAssetItem: async (tableName, itemId) => {
    const { email } = requireUser();
    if (tableName !== 'CustomAssetItems') return false;
    const col = TABLE_MAP.CustomAssetItems;
    const matches = await findUserDocsForId(col, email, itemId);
    if (!matches.length) return false;
    await Promise.all(matches.map((d) => deleteDoc(d.ref)));
    return true;
  },

  fetchAssets: async (tableName, userEmail) => {
    const email = userEmail || requireUser().email;
    const sub = TABLE_MAP[tableName];
    if (!sub) return [];
    const docs = await listUserDocs(sub, email);
    return docs.map((d) => {
      const data = d.data();
      return { ...data, id: data.id ?? d.id };
    });
  },

  calculateTotalValue: (assets, valueField = 'value') => {
    return assets.reduce((sum, asset) => sum + parseFloat(asset[valueField] || 0), 0);
  },

  // Save a user's import mapping for a given asset type.
  saveImportMapping: async (type, mapping) => {
    const { email } = requireUser();
    const docId = `${email}_${type}`;
    const ref = doc(db, 'importMappings', docId);
    await setDoc(ref, { userEmail: email, type, mapping, updatedAt: new Date().toISOString() });
    return { id: docId, userEmail: email, type, mapping };
  },

  // Fetch an import mapping for the current user and type, or null if not found.
  fetchImportMapping: async (type) => {
    const { email } = requireUser();
    const docId = `${email}_${type}`;
    const ref = doc(db, 'importMappings', docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
  },

  // List all saved import mappings for current user
  fetchAllImportMappings: async () => {
    const { email } = requireUser();
    const col = collection(db, 'importMappings');
    const q = query(col, where('userEmail', '==', email));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  deleteImportMapping: async (docId) => {
    const { email } = requireUser();
    const ref = doc(db, 'importMappings', docId);
    await deleteDoc(ref);
    return true;
  },
};

export default FirestoreAssetService;
