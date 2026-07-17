// Debt Payoff Calculator & Scenario Modeling
// Calculates payoff timelines and shows what-if scenarios

export const calculateDebtPayoffScenario = (principal, interestRate, monthlyPayment, extraPayment = 0) => {
  // principal: total debt
  // interestRate: annual interest rate (e.g., 5 for 5%)
  // monthlyPayment: minimum payment
  // extraPayment: extra amount to pay monthly
  const totalMonthlyPayment = monthlyPayment + extraPayment;
  const monthlyRate = interestRate / 100 / 12;

  if (monthlyRate === 0) {
    // No interest
    const months = Math.ceil(principal / totalMonthlyPayment);
    return {
      months,
      years: (months / 12).toFixed(1),
      totalInterestPaid: 0,
      totalAmountPaid: principal,
      timeline: `${months} months (${(months / 12).toFixed(1)} years)`,
    };
  }

  let balance = principal;
  let month = 0;
  let totalInterest = 0;
  const timeline = [];

  while (balance > 0 && month < 600) {
    // 50 year limit
    const interestCharge = balance * monthlyRate;
    const principalPayment = Math.min(totalMonthlyPayment - interestCharge, balance);

    balance -= principalPayment;
    totalInterest += interestCharge;
    month += 1;

    if (month % 12 === 0 || balance <= 0) {
      timeline.push({
        month,
        balance: Math.max(0, balance),
        totalInterestPaid: totalInterest,
      });
    }
  }

  return {
    months: month,
    years: (month / 12).toFixed(1),
    totalInterestPaid: Math.round(totalInterest),
    totalAmountPaid: Math.round(principal + totalInterest),
    timeline,
    monthlyPayment: totalMonthlyPayment,
  };
};

// Compare payoff scenarios (e.g., extra $100/month saves how much?)
export const comparePayoffScenarios = (principal, interestRate, minPayment) => {
  const baseScenario = calculateDebtPayoffScenario(principal, interestRate, minPayment, 0);
  const scenarios = [];

  [50, 100, 200, 500].forEach((extra) => {
    const s = calculateDebtPayoffScenario(principal, interestRate, minPayment, extra);
    const saved = baseScenario.months - s.months;
    const interestSaved = baseScenario.totalInterestPaid - s.totalInterestPaid;
    scenarios.push({
      extraPayment: extra,
      months: s.months,
      years: s.years,
      interestSaved: Math.round(interestSaved),
      timesSaved: `${saved} months`,
    });
  });

  return scenarios;
};
