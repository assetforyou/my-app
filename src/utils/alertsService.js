// Alerts & Notifications System
import { auth, db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';

const AlertsService = {
  // Alert types: price_change, rebalance_due, debt_alert, goal_milestone, tax_harvest
  addAlert: async (alert) => {
    const user = auth.currentUser;
    if (!user?.email) throw new Error('User not authenticated');
    const colRef = collection(db, 'alerts');
    const newRef = doc(colRef);
    const payload = {
      ...alert,
      id: newRef.id,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
      dismissed: false,
    };
    await setDoc(newRef, payload);
    return payload;
  },

  // Fetch active (non-dismissed) alerts for user
  fetchActiveAlerts: async (userEmail) => {
    const q = query(
      collection(db, 'alerts'),
      where('userEmail', '==', userEmail),
      where('dismissed', '==', false)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // Dismiss alert
  dismissAlert: async (alertId) => {
    const ref = doc(db, 'alerts', alertId);
    await setDoc(ref, { dismissed: true }, { merge: true });
  },

  // Delete alert
  deleteAlert: async (alertId) => {
    await deleteDoc(doc(db, 'alerts', alertId));
  },

  // Auto-generate alerts based on portfolio state
  generateAlerts: async (portfolio, monthlyIncome, monthlyExpenses, userEmail) => {
    const existingAlerts = await AlertsService.fetchActiveAlerts(userEmail);
    const existingTypes = existingAlerts.map((a) => a.type + '_' + (a.assetId || '')).join('|');

    const newAlerts = [];

    // 1. Emergency fund alert
    const emergencyFundMonths = monthlyExpenses > 0 ? (portfolio.cash || 0) / monthlyExpenses : 0;
    if (emergencyFundMonths < 1 && !existingTypes.includes('emergency_fund')) {
      newAlerts.push({
        type: 'emergency_fund',
        title: 'Low Emergency Fund',
        description: `You have ${emergencyFundMonths.toFixed(1)} months of expenses in cash. Aim for 3-6 months.`,
        severity: 'high',
      });
    }

    // 2. High debt alert
    const totalDebt = portfolio.totalLiabilities || 0;
    const debtRatio = monthlyIncome > 0 ? totalDebt / (monthlyIncome * 12) : 0;
    if (debtRatio > 3 && !existingTypes.includes('high_debt')) {
      newAlerts.push({
        type: 'high_debt',
        title: 'High Debt Levels',
        description: `Your debt-to-income ratio is ${debtRatio.toFixed(1)}. Consider paying down debt.`,
        severity: 'high',
        link: '/loans',
      });
    }

    // 3. Poor diversification alert
    const assetTypes = [
      portfolio.stocks > 0,
      portfolio.crypto > 0,
      portfolio.property > 0,
      portfolio.bonds > 0,
      portfolio.cash > 0,
    ].filter(Boolean).length;
    if (assetTypes < 2 && !existingTypes.includes('diversification')) {
      newAlerts.push({
        type: 'diversification',
        title: 'Limited Diversification',
        description: 'Your portfolio is concentrated in few asset types. Consider diversifying.',
        severity: 'medium',
      });
    }

    // 4. Spending exceeds savings alert
    if (monthlyIncome < monthlyExpenses && !existingTypes.includes('overspending')) {
      newAlerts.push({
        type: 'overspending',
        title: 'Spending Exceeds Income',
        description: `You're spending $${monthlyExpenses.toFixed(0)}/month but earning $${monthlyIncome.toFixed(0)}.`,
        severity: 'high',
      });
    }

    // Save all new alerts
    for (const alert of newAlerts) {
      await AlertsService.addAlert(alert);
    }

    return newAlerts;
  },
};

export default AlertsService;
