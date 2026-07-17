// Financial Health Score Calculator
// Provides an overall score (0-100) and actionable recommendations

export const calculateFinancialHealthScore = (portfolio, monthlyIncome, monthlyExpenses) => {
  let score = 50; // baseline
  const issues = [];
  const achievements = [];

  const totalAssets = portfolio.totalAssets || 0;
  const totalLiabilities = portfolio.totalLiabilities || 0;
  const netWorth = totalAssets - totalLiabilities;

  // 1. Emergency fund (3-6 months of expenses recommended)
  const emergencyFundMonths = monthlyExpenses > 0 ? (portfolio.cash || 0) / monthlyExpenses : 0;
  if (emergencyFundMonths >= 6) {
    score += 15;
    achievements.push('Excellent emergency fund (6+ months)');
  } else if (emergencyFundMonths >= 3) {
    score += 10;
    achievements.push('Good emergency fund (3-6 months)');
  } else if (emergencyFundMonths >= 1) {
    score += 5;
    issues.push('Increase emergency fund to 3-6 months');
  } else {
    issues.push('Critical: Build emergency fund (target 3-6 months expenses)');
  }

  // 2. Debt-to-income ratio (lower is better)
  const debtToIncomeRatio = monthlyIncome > 0 ? totalLiabilities / (monthlyIncome * 12) : 0;
  if (debtToIncomeRatio < 1) {
    score += 15;
    achievements.push('Healthy debt-to-income ratio');
  } else if (debtToIncomeRatio < 3) {
    score += 10;
    issues.push('Consider paying down debt (ratio: ' + debtToIncomeRatio.toFixed(1) + ')');
  } else {
    issues.push('High debt levels relative to income');
  }

  // 3. Net worth growth (positive is good)
  if (netWorth > 0) {
    score += 10;
    achievements.push('Positive net worth');
  } else if (netWorth < 0) {
    issues.push('Negative net worth: focus on building assets or reducing liabilities');
  }

  // 4. Savings rate (aim for 20%+)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  if (savingsRate >= 20) {
    score += 12;
    achievements.push('Strong savings rate (' + savingsRate.toFixed(0) + '%)');
  } else if (savingsRate >= 10) {
    score += 8;
    issues.push('Increase savings rate (currently ' + savingsRate.toFixed(0) + '%)');
  } else if (savingsRate > 0) {
    score += 5;
    issues.push('Low savings rate; aim for 20%+');
  } else {
    issues.push('Spending exceeds income');
  }

  // 5. Asset diversification (simplified: if only one type, penalize)
  const assetTypes = [
    portfolio.cash > 0,
    portfolio.stocks > 0,
    portfolio.crypto > 0,
    portfolio.property > 0,
    portfolio.bonds > 0,
  ].filter(Boolean).length;
  if (assetTypes >= 3) {
    score += 10;
    achievements.push('Good asset diversification');
  } else if (assetTypes >= 2) {
    score += 5;
    issues.push('Consider diversifying across more asset classes');
  } else {
    issues.push('Critical: Diversify your portfolio');
  }

  // 6. Expense management (if spending < 80% of income, good)
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
  if (expenseRatio < 70) {
    score += 8;
    achievements.push('Excellent expense control');
  } else if (expenseRatio < 80) {
    score += 4;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Create recommendations
  const recommendations = [
    ...issues.slice(0, 3),
    ...achievements.slice(0, 2),
  ];

  return {
    score: Math.round(score),
    savingsRate: Math.round(savingsRate),
    netWorth,
    emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
    debtToIncomeRatio: Math.round(debtToIncomeRatio * 10) / 10,
    recommendations,
    issues,
    achievements,
  };
};

// Get color/icon for score
export const getScoreColor = (score) => {
  if (score >= 80) return { color: '#10b981', label: 'Excellent' };
  if (score >= 60) return { color: '#f59e0b', label: 'Good' };
  if (score >= 40) return { color: '#f97316', label: 'Fair' };
  return { color: '#ef4444', label: 'Needs work' };
};
