// Tax Reporting & Gains Calculator
// Calculates capital gains, cost basis, and generates tax reports

export const calculateCapitalGains = (purchases) => {
  // purchases: [{ date, quantity, pricePerUnit, currentPrice, sold }]
  const gains = [];
  let totalGains = 0;
  let totalLosses = 0;

  purchases.forEach((p) => {
    const costBasis = (p.quantity || 0) * (p.pricePerUnit || 0);
    const currentValue = (p.quantity || 0) * (p.currentPrice || 0);
    const gain = currentValue - costBasis;

    if (gain !== 0) {
      gains.push({
        asset: p.name || p.symbol || 'Unknown',
        costBasis,
        currentValue,
        gain,
        gainPercent: costBasis > 0 ? ((gain / costBasis) * 100).toFixed(2) : 0,
        date: p.date,
        soldDate: p.soldDate,
        longTermGain: p.soldDate && new Date(p.soldDate) - new Date(p.date) > 365 * 24 * 60 * 60 * 1000,
      });

      if (gain > 0) totalGains += gain;
      else totalLosses += -gain;
    }
  });

  return {
    gains,
    totalGains: Math.round(totalGains),
    totalLosses: Math.round(totalLosses),
    netGains: Math.round(totalGains - totalLosses),
  };
};

// Generate tax-loss harvesting opportunities
export const generateTaxHarvestingOpportunities = (assets) => {
  // Find assets with unrealized losses that could be sold
  return assets
    .filter((a) => (a.currentValue || 0) < (a.costBasis || 0))
    .map((a) => ({
      asset: a.name || a.symbol,
      costBasis: a.costBasis,
      currentValue: a.currentValue,
      loss: a.costBasis - a.currentValue,
      lossPercent: (((a.costBasis - a.currentValue) / a.costBasis) * 100).toFixed(2),
    }))
    .sort((a, b) => b.loss - a.loss)
    .slice(0, 5);
};

// Generate tax report for the year
export const generateTaxReport = (year, assets) => {
  const yearStart = new Date(`${year}-01-01`);
  const yearEnd = new Date(`${year}-12-31`);

  const salesInYear = assets.filter((a) => {
    const soldDate = new Date(a.soldDate || a.date);
    return soldDate >= yearStart && soldDate <= yearEnd;
  });

  const { totalGains, totalLosses, netGains } = calculateCapitalGains(salesInYear);

  const longTermGains = salesInYear
    .filter((a) => {
      const hold = new Date(a.soldDate) - new Date(a.date);
      return hold > 365 * 24 * 60 * 60 * 1000;
    })
    .reduce((sum, a) => sum + Math.max(0, (a.currentValue || 0) - (a.costBasis || 0)), 0);

  const shortTermGains = totalGains - longTermGains;

  return {
    year,
    totalSales: salesInYear.length,
    totalGains: Math.round(totalGains),
    totalLosses: Math.round(totalLosses),
    netGains: Math.round(netGains),
    longTermGains: Math.round(longTermGains),
    shortTermGains: Math.round(shortTermGains),
    summary: `Year ${year}: ${salesInYear.length} sales, $${totalGains} gains, $${totalLosses} losses, Net: $${netGains}`,
  };
};
