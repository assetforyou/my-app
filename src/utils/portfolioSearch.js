import { getAssetScope } from './assetScope';

function holdingItem(id, name, action, category, scope, keywords = '') {
  return { id, name, type: 'holding', action, category, scope, keywords, path: '/landing' };
}

export function buildPortfolioSearchItems(data) {
  const items = [];
  const {
    cashList = [], stockList = [], cryptoList = [], propertyList = [],
    carList = [], metalList = [], loanList = [], bondList = [],
    retirementList = [], savingsList = [], commoditiesList = [],
    artCollectiblesList = [], luxuryWatchesList = [], privateEquityList = [],
    intellectualPropertyList = [], customAssets = [],
  } = data;

  cashList.forEach((c) => {
    items.push(holdingItem(
      `cash-${c.id}`,
      c.description || `Cash ${c.currency || 'USD'} ${c.amount}`,
      'cash', 'Cash', getAssetScope(c, 'cash'),
      `${c.description || ''} ${c.accountType || ''}`
    ));
  });

  stockList.forEach((s) => {
    items.push(holdingItem(
      `stock-${s.id}`,
      s.name || s.ticker || 'Stock',
      'stocks', 'Stocks', getAssetScope(s, 'stocks'),
      `${s.name || ''} ${s.sector || ''}`
    ));
  });

  cryptoList.forEach((c) => {
    items.push(holdingItem(
      `crypto-${c.id}`,
      c.name || c.symbol || 'Crypto',
      'crypto', 'Crypto', getAssetScope(c, 'crypto'),
      `${c.symbol || ''} ${c.name || ''}`
    ));
  });

  propertyList.forEach((p) => {
    items.push(holdingItem(
      `property-${p.id}`,
      p.address || p.name || 'Property',
      'property', 'Property', getAssetScope(p, 'property'),
      p.address || ''
    ));
  });

  carList.forEach((c) => {
    items.push(holdingItem(
      `auto-${c.id}`,
      `${c.make || ''} ${c.model || ''}`.trim() || 'Auto',
      'auto', 'Auto', getAssetScope(c, 'auto'),
      `${c.make || ''} ${c.model || ''} ${c.year || ''}`
    ));
  });

  metalList.forEach((m) => {
    items.push(holdingItem(
      `metal-${m.id}`,
      m.type || 'Metal',
      'metals', 'Metals', getAssetScope(m, 'metals'),
      m.type || ''
    ));
  });

  loanList.forEach((l) => {
    items.push(holdingItem(
      `loan-${l.id}`,
      l.name || 'Loan',
      'loan', 'Loans', getAssetScope(l, 'loan'),
      l.name || ''
    ));
  });

  bondList.forEach((b) => {
    items.push(holdingItem(
      `bond-${b.id}`,
      b.name || b.issuer || 'Bond',
      'bonds', 'Bonds', getAssetScope(b, 'bonds'),
      `${b.name || ''} ${b.issuer || ''}`
    ));
  });

  retirementList.forEach((r) => {
    items.push(holdingItem(
      `retirement-${r.id}`,
      r.name || r.institution || 'Retirement',
      'retirement', 'Retirement', getAssetScope(r, 'retirement'),
      `${r.name || ''} ${r.institution || ''}`
    ));
  });

  savingsList.forEach((s) => {
    items.push(holdingItem(
      `savings-${s.id}`,
      s.name || 'Savings',
      'savings', 'Savings', getAssetScope(s, 'savings'),
      s.name || ''
    ));
  });

  commoditiesList.forEach((c) => {
    items.push(holdingItem(
      `commodity-${c.id}`,
      c.name || c.type || 'Commodity',
      'commodities', 'Commodities', getAssetScope(c, 'commodities'),
      c.name || ''
    ));
  });

  artCollectiblesList.forEach((a) => {
    items.push(holdingItem(
      `art-${a.id}`,
      a.title || a.artist || 'Art',
      'artCollectibles', 'Art', getAssetScope(a, 'artCollectibles'),
      `${a.title || ''} ${a.artist || ''}`
    ));
  });

  luxuryWatchesList.forEach((w) => {
    items.push(holdingItem(
      `watch-${w.id}`,
      `${w.brand || ''} ${w.model || ''}`.trim() || 'Watch',
      'luxuryWatches', 'Watches', getAssetScope(w, 'luxuryWatches'),
      `${w.brand || ''} ${w.model || ''}`
    ));
  });

  privateEquityList.forEach((p) => {
    items.push(holdingItem(
      `pe-${p.id}`,
      p.businessName || 'Private Equity',
      'privateEquity', 'Private Equity', getAssetScope(p, 'privateEquity'),
      p.businessName || ''
    ));
  });

  intellectualPropertyList.forEach((ip) => {
    items.push(holdingItem(
      `ip-${ip.id}`,
      ip.title || ip.name || 'IP',
      'intellectualProperty', 'IP', getAssetScope(ip, 'intellectualProperty'),
      ip.title || ip.name || ''
    ));
  });

  customAssets.forEach((a) => {
    items.push(holdingItem(
      `custom-${a.id}`,
      a.name || 'Custom Asset',
      `custom-${a.id}`, 'Custom', getAssetScope(a, null),
      a.name || ''
    ));
  });

  return items;
}

export function defaultScopeForFilter(assetFilter) {
  return assetFilter === 'business' ? 'business' : 'personal';
}
