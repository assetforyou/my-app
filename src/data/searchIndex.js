/**
 * Static navigation + action items for global search (outside React render path).
 */
export const SEARCH_NAV_ITEMS = [
  { id: 'nav-dashboard', name: 'Dashboard', type: 'page', keywords: 'home overview net worth', action: 'dashboard', category: 'Navigation' },
  { id: 'nav-home', name: 'All Assets', type: 'page', keywords: 'summary grid list', action: 'home', category: 'Navigation' },
  { id: 'nav-analytics', name: 'Analytics', type: 'page', keywords: 'analysis charts goals risk tax', action: 'analytics', category: 'Navigation' },
  { id: 'nav-create', name: 'Create Asset', type: 'action', keywords: 'add new custom', action: 'createAsset', category: 'Actions' },
  { id: 'nav-settings', name: 'Account Settings', type: 'action', keywords: 'profile email password', action: 'accountSettings', category: 'Settings' },
  { id: 'asset-cash', name: 'Cash', type: 'asset', keywords: 'money bank checking savings', action: 'cash', category: 'Cash & Debt' },
  { id: 'asset-loan', name: 'Loans', type: 'asset', keywords: 'debt mortgage liability', action: 'loan', category: 'Cash & Debt' },
  { id: 'asset-stocks', name: 'Stocks', type: 'asset', keywords: 'equity shares ticker', action: 'stocks', category: 'Investments' },
  { id: 'asset-bonds', name: 'Bonds', type: 'asset', keywords: 'fixed income', action: 'bonds', category: 'Investments' },
  { id: 'asset-crypto', name: 'Crypto', type: 'asset', keywords: 'bitcoin ethereum btc', action: 'crypto', category: 'Investments' },
  { id: 'asset-retirement', name: 'Retirement', type: 'asset', keywords: '401k ira pension', action: 'retirement', category: 'Investments' },
  { id: 'asset-savings', name: 'Savings', type: 'asset', keywords: 'emergency fund cd', action: 'savings', category: 'Investments' },
  { id: 'asset-property', name: 'Property', type: 'asset', keywords: 'real estate house rental', action: 'property', category: 'Real Assets' },
  { id: 'asset-auto', name: 'Auto', type: 'asset', keywords: 'car vehicle', action: 'auto', category: 'Real Assets' },
  { id: 'asset-metals', name: 'Metals', type: 'asset', keywords: 'gold silver bullion', action: 'metals', category: 'Real Assets' },
  { id: 'asset-commodities', name: 'Commodities', type: 'asset', keywords: 'oil gas futures', action: 'commodities', category: 'Real Assets' },
  { id: 'asset-art', name: 'Art & Collectibles', type: 'asset', keywords: 'art collectibles', action: 'artCollectibles', category: 'Alternatives' },
  { id: 'asset-watches', name: 'Luxury Watches', type: 'asset', keywords: 'rolex patek timepiece', action: 'luxuryWatches', category: 'Alternatives' },
  { id: 'asset-pe', name: 'Private Equity', type: 'asset', keywords: 'startup llc ownership', action: 'privateEquity', category: 'Alternatives' },
  { id: 'asset-ip', name: 'Intellectual Property', type: 'asset', keywords: 'patent royalty trademark', action: 'intellectualProperty', category: 'Alternatives' },
];

export function scoreSearchItem(item, query) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const name = item.name.toLowerCase();
  const category = (item.category || '').toLowerCase();
  const keywords = (item.keywords || '').toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (keywords.includes(q)) return 40;
  if (category.includes(q)) return 30;
  return 0;
}

export function filterSearchItems(items, query, limit = 12) {
  const q = query.trim();
  if (!q) {
    return items.filter((i) => i.type === 'page' || i.type === 'action').slice(0, 8);
  }
  return items
    .map((item) => ({ item, score: scoreSearchItem(item, q) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
}
