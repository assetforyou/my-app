/** Personal vs business scope for each asset record. */

export const ASSET_SCOPE = {
  PERSONAL: 'personal',
  BUSINESS: 'business',
};

export const SCOPE_FILTER = {
  ALL: 'all',
  ...ASSET_SCOPE,
};

/** Legacy fallback when older records have no scope field. */
const LEGACY_TYPE_DEFAULTS = {
  auto: ASSET_SCOPE.PERSONAL,
  cash: ASSET_SCOPE.PERSONAL,
  metals: ASSET_SCOPE.PERSONAL,
  crypto: ASSET_SCOPE.PERSONAL,
  artCollectibles: ASSET_SCOPE.PERSONAL,
  luxuryWatches: ASSET_SCOPE.PERSONAL,
  stocks: ASSET_SCOPE.BUSINESS,
  bonds: ASSET_SCOPE.BUSINESS,
  retirement: ASSET_SCOPE.BUSINESS,
  savings: ASSET_SCOPE.BUSINESS,
  property: ASSET_SCOPE.BUSINESS,
  privateEquity: ASSET_SCOPE.BUSINESS,
  intellectualProperty: ASSET_SCOPE.BUSINESS,
  commodities: ASSET_SCOPE.BUSINESS,
  loan: ASSET_SCOPE.PERSONAL,
};

export function getAssetScope(asset, assetTypeKey) {
  if (asset?.scope === ASSET_SCOPE.PERSONAL || asset?.scope === ASSET_SCOPE.BUSINESS) {
    return asset.scope;
  }
  if (assetTypeKey && LEGACY_TYPE_DEFAULTS[assetTypeKey]) {
    return LEGACY_TYPE_DEFAULTS[assetTypeKey];
  }
  return ASSET_SCOPE.PERSONAL;
}

export function filterByScope(assets, filter, assetTypeKey) {
  if (!Array.isArray(assets)) return [];
  if (!filter || filter === SCOPE_FILTER.ALL) return assets;
  return assets.filter((asset) => getAssetScope(asset, assetTypeKey) === filter);
}

export function scopeLabel(scope) {
  return scope === ASSET_SCOPE.BUSINESS ? 'Business' : 'Personal';
}

export function matchesScopeFilter(asset, filter, assetTypeKey) {
  if (!filter || filter === SCOPE_FILTER.ALL) return true;
  return getAssetScope(asset, assetTypeKey) === filter;
}
