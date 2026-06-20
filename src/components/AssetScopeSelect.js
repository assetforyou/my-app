import React from 'react';
import { User, Building2 } from 'lucide-react';
import { ASSET_SCOPE } from '../utils/assetScope';
import '../style/AssetScopeSelect.css';

const AssetScopeSelect = ({ value, onChange, name = 'scope', id = 'asset-scope' }) => (
  <div className="asset-scope-select">
    <label className="asset-scope-select__label" htmlFor={id}>
      Ownership
    </label>
    <div className="asset-scope-select__options" role="radiogroup" aria-label="Asset ownership">
      <label className={`asset-scope-option${value === ASSET_SCOPE.PERSONAL ? ' is-selected' : ''}`}>
        <input
          type="radio"
          name={name}
          id={id}
          value={ASSET_SCOPE.PERSONAL}
          checked={value === ASSET_SCOPE.PERSONAL}
          onChange={(e) => onChange(e.target.value)}
        />
        <User size={16} aria-hidden />
        <span>Personal</span>
      </label>
      <label className={`asset-scope-option${value === ASSET_SCOPE.BUSINESS ? ' is-selected' : ''}`}>
        <input
          type="radio"
          name={name}
          value={ASSET_SCOPE.BUSINESS}
          checked={value === ASSET_SCOPE.BUSINESS}
          onChange={(e) => onChange(e.target.value)}
        />
        <Building2 size={16} aria-hidden />
        <span>Business</span>
      </label>
    </div>
  </div>
);

export default AssetScopeSelect;
