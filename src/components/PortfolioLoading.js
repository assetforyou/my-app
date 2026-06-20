import React from 'react';
import LoadingSkeleton from './LoadingSkeleton';
import '../style/MobileNav.css';

/**
 * Consistent loading state for dashboard views and asset pages.
 */
export function PortfolioLoading({ type = 'metrics' }) {
  return (
    <div className="vk-page-loading">
      <LoadingSkeleton type={type} count={type === 'card' ? 4 : undefined} />
    </div>
  );
}

export default PortfolioLoading;
