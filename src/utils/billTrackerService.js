// Bill & Subscription Tracker
import { auth, db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';

const BillTrackerService = {
  // Add recurring bill/subscription
  addBill: async (bill) => {
    const user = auth.currentUser;
    if (!user?.email) throw new Error('User not authenticated');
    const colRef = collection(db, 'bills');
    const newRef = doc(colRef);
    const payload = {
      ...bill,
      id: newRef.id,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
      status: 'active', // active, paused, cancelled
    };
    await setDoc(newRef, payload);
    return payload;
  },

  // Fetch active bills
  fetchActiveBills: async (userEmail) => {
    const q = query(
      collection(db, 'bills'),
      where('userEmail', '==', userEmail),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // Calculate monthly bill total
  calculateMonthlyBills: (bills) => {
    // bills: [{ amount, frequency: 'monthly', 'annual', etc. }]
    let total = 0;
    bills.forEach((b) => {
      if (b.frequency === 'monthly') total += b.amount;
      else if (b.frequency === 'annual') total += b.amount / 12;
      else if (b.frequency === 'quarterly') total += b.amount / 3;
      else if (b.frequency === 'weekly') total += b.amount * 4.33; // weeks per month
    });
    return Math.round(total * 100) / 100;
  },

  // Find unused/low-value subscriptions
  findReductionOpportunities: (bills) => {
    return bills
      .filter((b) => b.amount < 20 && b.frequency !== 'annual') // small recurring bills
      .map((b) => ({
        name: b.name,
        currentCost: b.amount,
        frequency: b.frequency,
        yearlyCost: b.frequency === 'monthly' ? b.amount * 12 : b.amount,
        recommendation: `Cancel or reduce: saves $${(b.frequency === 'monthly' ? b.amount * 12 : b.amount).toFixed(0)}/year`,
      }));
  },

  // Cancel/pause bill
  updateBill: async (billId, updates) => {
    const ref = doc(db, 'bills', billId);
    await setDoc(ref, updates, { merge: true });
  },

  // Delete bill
  deleteBill: async (billId) => {
    await deleteDoc(doc(db, 'bills', billId));
  },
};

export default BillTrackerService;
