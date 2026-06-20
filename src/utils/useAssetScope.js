import { useState, useEffect } from 'react';
import { defaultScopeForFilter } from './portfolioSearch';

export function useAssetScope(assetFilter = 'all') {
  const [scope, setScope] = useState(() => defaultScopeForFilter(assetFilter));

  useEffect(() => {
    setScope(defaultScopeForFilter(assetFilter));
  }, [assetFilter]);

  return [scope, setScope];
}
