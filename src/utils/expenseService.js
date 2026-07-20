// Expense & cashflow tracking service
import { auth, db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';

const ExpenseService = {
  // Save expense record
  addExpense: async (expense) => {
    const user = auth.currentUser;
    const userEmail = expense?.userEmail || user?.email;
    if (!userEmail) throw new Error('User not authenticated');

    const colRef = collection(db, 'expenses');
    const newRef = doc(colRef);

    const payload = {
      ...expense,
      id: newRef.id,
      userEmail,
      createdAt: new Date().toISOString(),
      amount: Number(expense?.amount ?? 0),
    };

    await setDoc(newRef, payload);
    return payload;
  },

  // Fetch expenses for user in date range
  fetchExpenses: async (userEmail, startDate, endDate) => {
    const q = query(collection(db, 'expenses'), where('userEmail', '==', userEmail));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...d.data() }))
      .filter((e) => {
        const date = new Date(e.date || e.createdAt);
        return date >= startDate && date <= endDate;
      });
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    await deleteDoc(doc(db, 'expenses', expenseId));
  },

  // Calculate monthly summary
  calculateMonthlySummary: (expenses) => {
    const byCategory = {};
    let totalExpenses = 0;
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + parseFloat(e.amount || 0);
      totalExpenses += parseFloat(e.amount || 0);
    });
    return { byCategory, totalExpenses };
  },

  // Save income record
  addIncome: async (income) => {
    const user = auth.currentUser;
    const userEmail = income?.userEmail || user?.email;
    if (!userEmail) throw new Error('User not authenticated');

    const colRef = collection(db, 'income');
    const newRef = doc(colRef);

    const payload = {
      ...income,
      id: newRef.id,
      userEmail,
      createdAt: new Date().toISOString(),
      amount: Number(income?.amount ?? 0),
    };

    await setDoc(newRef, payload);
    return payload;
  },

  // Fetch income for user in date range
  fetchIncome: async (userEmail, startDate, endDate) => {
    const q = query(collection(db, 'income'), where('userEmail', '==', userEmail));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...d.data() }))
      .filter((i) => {
        const date = new Date(i.date || i.createdAt);
        return date >= startDate && date <= endDate;
      });
  },

  // Calculate savings rate: (Income - Expenses) / Income * 100
  calculateSavingsRate: (totalIncome, totalExpenses) => {
    if (totalIncome === 0) return 0;
    return Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);
  },
};

export default ExpenseService;
