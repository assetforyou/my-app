export const SIDEBAR_PRIMARY = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'home', label: 'All Assets' },
  { id: 'analytics', label: 'Analytics' },
];

export const SIDEBAR_ASSET_GROUPS = [
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
