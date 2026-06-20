/**
 * Shared portfolio calculations used across dashboard, export, and snapshots.
 */

export function formatCurrency(value, options = {}) {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: options.decimals ?? 0,
  }).format(num);
}

export function calculatePortfolioTotals(totals) {
  const {
    cashTotal = 0,
    stockTotal = 0,
    metalTotal = 0,
    propertyTotalPrice = 0,
    cryptoTotal = 0,
    autoTotal = 0,
    bondTotal = 0,
    retirementTotal = 0,
    savingsTotal = 0,
    commoditiesTotal = 0,
    artCollectiblesTotal = 0,
    luxuryWatchesTotal = 0,
    privateEquityTotal = 0,
    intellectualPropertyTotal = 0,
    loanTotal = 0,
    customAssets = [],
  } = totals;

  const customTotal = customAssets.reduce(
    (sum, asset) => sum + parseFloat(asset.totalValue || 0),
    0
  );

  const categoryValues = {
    Cash: cashTotal,
    Stocks: stockTotal,
    Metals: metalTotal,
    Property: propertyTotalPrice,
    Crypto: cryptoTotal,
    Autos: autoTotal,
    Bonds: bondTotal,
    Retirement: retirementTotal,
    Savings: savingsTotal,
    Commodities: commoditiesTotal,
    'Art & Collectibles': artCollectiblesTotal,
    'Luxury Watches': luxuryWatchesTotal,
    'Private Equity': privateEquityTotal,
    'Intellectual Property': intellectualPropertyTotal,
    Custom: customTotal,
  };

  const totalAssets = Object.values(categoryValues).reduce((s, v) => s + v, 0);
  const totalLiabilities = loanTotal;
  const netWorth = totalAssets - totalLiabilities;
  const activeCategories = Object.entries(categoryValues).filter(([, v]) => v > 0).length;

  const assetAllocation = Object.entries(categoryValues)
    .filter(([, value]) => value > 0)
    .map(([name, value], index) => ({
      name,
      value,
      color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
    }));

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    activeCategories,
    customTotal,
    categoryValues,
    assetAllocation,
  };
}

const ALLOCATION_COLORS = [
  '#0d9488', '#2563eb', '#ca8a04', '#7c3aed', '#db2777',
  '#ea580c', '#0891b2', '#16a34a', '#dc2626', '#6366f1',
  '#84cc16', '#f97316', '#06b6d4', '#8b5cf6',
];

export function countTotalAssets(lists) {
  return Object.values(lists).reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
}

export function generatePortfolioInsights({ netWorth, totalAssets, loanTotal, assetAllocation }) {
  const insights = [];

  if (totalAssets === 0 && loanTotal === 0) {
    insights.push({
      type: 'info',
      title: 'Get started',
      message: 'Add your first asset to see net worth, allocation, and personalized insights.',
    });
    return insights;
  }

  if (loanTotal > 0 && totalAssets > 0) {
    const ltv = (loanTotal / totalAssets) * 100;
    if (ltv > 40) {
      insights.push({
        type: 'warning',
        title: 'High debt ratio',
        message: `Your liabilities are ${ltv.toFixed(0)}% of total assets. Consider reducing debt or growing assets.`,
      });
    } else if (ltv > 20) {
      insights.push({
        type: 'info',
        title: 'Moderate leverage',
        message: `Debt represents ${ltv.toFixed(0)}% of your assets. Monitor as markets shift.`,
      });
    }
  }

  if (assetAllocation.length === 1) {
    insights.push({
      type: 'info',
      title: 'Concentrated portfolio',
      message: `100% of tracked assets are in ${assetAllocation[0].name}. Diversification may reduce risk.`,
    });
  } else if (assetAllocation.length >= 2) {
    const top = [...assetAllocation].sort((a, b) => b.value - a.value)[0];
    const topPct = totalAssets > 0 ? (top.value / totalAssets) * 100 : 0;
    if (topPct > 70) {
      insights.push({
        type: 'warning',
        title: 'Heavy concentration',
        message: `${top.name} makes up ${topPct.toFixed(0)}% of your portfolio.`,
      });
    }
  }

  if (netWorth > 0) {
    insights.push({
      type: 'success',
      title: 'Portfolio tracked',
      message: `Your net worth is ${formatCurrency(netWorth)} across ${assetAllocation.length} asset ${assetAllocation.length === 1 ? 'class' : 'classes'}.`,
    });
  } else if (netWorth < 0) {
    insights.push({
      type: 'warning',
      title: 'Negative net worth',
      message: 'Liabilities exceed assets. Focus on debt reduction and asset growth.',
    });
  }

  return insights.slice(0, 4);
}
