// Simple Investment Recommendations
// Rule-based suggestions based on portfolio and profile

export const generateInvestmentRecommendations = (portfolio, age, income, riskTolerance) => {
  const recommendations = [];
  const targetAllocation = calculateTargetAllocation(age, riskTolerance);

  // Check each asset class
  const allocations = {
    stocks: portfolio.stocks / (portfolio.totalAssets || 1),
    bonds: portfolio.bonds / (portfolio.totalAssets || 1),
    cash: portfolio.cash / (portfolio.totalAssets || 1),
    crypto: portfolio.crypto / (portfolio.totalAssets || 1),
    property: portfolio.property / (portfolio.totalAssets || 1),
  };

  // Recommendation 1: Bonds for stability
  if (age > 40 && allocations.bonds < targetAllocation.bonds) {
    recommendations.push({
      priority: 'medium',
      title: 'Increase Bond Allocation',
      description: `At age ${age}, bonds should be ${(targetAllocation.bonds * 100).toFixed(0)}% of portfolio. Currently ${(allocations.bonds * 100).toFixed(0)}%.`,
      action: 'Gradually shift $X to bonds or bond funds',
    });
  }

  // Recommendation 2: Diversify away from single asset
  const hasHighConcentration = Object.values(allocations).some((a) => a > 0.6);
  if (hasHighConcentration) {
    recommendations.push({
      priority: 'high',
      title: 'Reduce Concentration Risk',
      description: 'Your portfolio is heavily concentrated. Diversify to reduce risk.',
      action: 'Allocate 20-30% to underweight asset classes',
    });
  }

  // Recommendation 3: Crypto for young investors
  if (age < 35 && allocations.crypto < 0.05 && riskTolerance === 'high') {
    recommendations.push({
      priority: 'low',
      title: 'Consider Crypto Allocation',
      description: 'For young investors with high risk tolerance, 2-5% in crypto can add upside.',
      action: 'Start with $500-1000 in Bitcoin or Ethereum',
    });
  }

  // Recommendation 4: Rebalance annually
  const outOfBalance = Object.entries(allocations).some(
    ([key, value]) => Math.abs(value - targetAllocation[key]) > 0.1
  );
  if (outOfBalance) {
    recommendations.push({
      priority: 'medium',
      title: 'Rebalance Portfolio',
      description: 'Your allocation has drifted from target. Rebalance to maintain strategy.',
      action: 'Sell overweight assets, buy underweight assets',
    });
  }

  // Recommendation 5: Emergency in cash
  const cashAllocPercent = allocations.cash * 100;
  const emergencyMonths = portfolio.monthlyExpenses > 0 ? portfolio.cash / portfolio.monthlyExpenses : 0;
  if (emergencyMonths < 3) {
    recommendations.push({
      priority: 'high',
      title: 'Build Emergency Fund',
      description: `You have ${emergencyMonths.toFixed(1)} months of expenses liquid. Target 3-6 months.`,
      action: `Add $${((3 * portfolio.monthlyExpenses) - portfolio.cash).toFixed(0)} to savings/cash`,
    });
  }

  return recommendations;
};

// Calculate target allocation based on age and risk
export const calculateTargetAllocation = (age, riskTolerance) => {
  let equityPercent = 100 - age; // classic rule of thumb
  if (riskTolerance === 'low') equityPercent -= 10;
  if (riskTolerance === 'high') equityPercent += 10;
  equityPercent = Math.max(30, Math.min(90, equityPercent)); // 30-90%

  const bondPercent = 100 - equityPercent;

  return {
    stocks: equityPercent * 0.7 / 100, // 70% of equity
    bonds: bondPercent / 100,
    cash: equityPercent * 0.1 / 100, // 10% of equity
    crypto: equityPercent * 0.1 / 100, // 10% for young/high risk
    property: equityPercent * 0.1 / 100, // 10% for diversification
  };
};

// Get recommendation priority color
export const getPriorityColor = (priority) => {
  if (priority === 'high') return '#ef4444';
  if (priority === 'medium') return '#f59e0b';
  return '#3b82f6';
};
