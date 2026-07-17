export const SIDEBAR_PRIMARY = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'home', label: 'All Assets' },
  { id: 'analytics', label: 'Analytics' },
];

export const SIDEBAR_ASSET_GROUPS = [
  {
    label: 'Financial Wellness',
    items: [
      { id: 'financialHealth', label: 'Health Score' },
      { id: 'expenses', label: 'Expenses & Cash Flow' },
      { id: 'alerts', label: 'Alerts & Insights' },
      { id: 'goals', label: 'Goals' },
      { id: 'investments', label: 'Investment Advice' },
      { id: 'debtPayoff', label: 'Debt Payoff' },
      { id: 'bills', label: 'Bills & Subscriptions' },
      { id: 'tax', label: 'Tax Report' },
    ],
  },
  {
    label: 'Investments',
    items: [
      { id: 'stocks', label: 'Stocks' },
      { id: 'bonds', label: 'Bonds' },
      { id: 'crypto', label: 'Crypto' },
      { id: 'retirement', label: 'Retirement' },
      { id: 'savings', label: 'Savings' },
    ],
  },
  {
    label: 'Real Assets',
    items: [
      { id: 'property', label: 'Property' },
      { id: 'auto', label: 'Auto' },
      { id: 'metals', label: 'Metals' },
      { id: 'commodities', label: 'Commodities' },
    ],
  },
  {
    label: 'Alternatives',
    items: [
      { id: 'artCollectibles', label: 'Art & Collectibles' },
      { id: 'luxuryWatches', label: 'Luxury Watches' },
      { id: 'privateEquity', label: 'Private Equity' },
      { id: 'intellectualProperty', label: 'Intellectual Property' },
    ],
  },
  {
    label: 'Cash & Debt',
    items: [
      { id: 'cash', label: 'Cash' },
      { id: 'loan', label: 'Loans' },
    ],
  },
];

/** @deprecated use SIDEBAR_PRIMARY + SIDEBAR_ASSET_GROUPS */
export const SIDEBAR_GROUPS = [
  { label: 'Overview', items: SIDEBAR_PRIMARY },
  ...SIDEBAR_ASSET_GROUPS,
];
