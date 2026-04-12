import React from 'react';
import { Placeholder, Spinner } from 'react-bootstrap';
import '../style/LoadingSkeleton.css';

/**
 * Loading skeleton component for better perceived performance
 * Uses react-bootstrap Placeholder component instead of non-existent Skeleton
 * @param {Object} props - Component props
 * @param {string} props.type - Type of skeleton ('card', 'table', 'text', 'circular')
 * @param {number} props.count - Number of skeleton items to render
 * @param {string} props.width - Custom width for skeleton
 * @param {string} props.height - Custom height for skeleton
 */
const LoadingSkeleton = ({ 
  type = 'card', 
  count = 3, 
  width = '100%', 
  height = '20px' 
}) => {
  // Card skeleton - for asset cards and metric cards
  if (type === 'card') {
    return (
      <div className="skeleton-container" style={{ '--skeleton-count': count }}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-card-header">
              <Placeholder 
                as="span" 
                animation="glow" 
                style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
              />
              <div className="skeleton-card-title">
                <Placeholder as="span" animation="glow" style={{ width: '120px', height: '20px' }} />
                <Placeholder as="span" animation="glow" style={{ width: '80px', height: '16px' }} />
              </div>
            </div>
            <Placeholder as="span" animation="glow" style={{ width: '80%', height: '24px' }} />
            <Placeholder as="span" animation="glow" style={{ width: '60%', height: '16px' }} />
          </div>
        ))}
      </div>
    );
  }

  // Table skeleton - for data tables
  if (type === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-table-header">
          <Placeholder as="span" animation="glow" style={{ width: '20%', height: '20px' }} />
          <Placeholder as="span" animation="glow" style={{ width: '20%', height: '20px' }} />
          <Placeholder as="span" animation="glow" style={{ width: '20%', height: '20px' }} />
          <Placeholder as="span" animation="glow" style={{ width: '20%', height: '20px' }} />
          <Placeholder as="span" animation="glow" style={{ width: '20%', height: '20px' }} />
        </div>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-table-row">
            <Placeholder as="span" animation="glow" style={{ width: '20%', height: '16px' }} />
            <Placeholder as="span" animation="glow" style={{ width: '20%', height: '16px' }} />
            <Placeholder as="span" animation="glow" style={{ width: '20%', height: '16px' }} />
            <Placeholder as="span" animation="glow" style={{ width: '20%', height: '16px' }} />
            <Placeholder as="span" animation="glow" style={{ width: '20%', height: '16px' }} />
          </div>
        ))}
      </div>
    );
  }

  // Text skeleton - for paragraphs and text content
  if (type === 'text') {
    return (
      <div className="skeleton-text-container">
        {Array.from({ length: count }).map((_, index) => (
          <Placeholder 
            key={index} 
            as="span" 
            animation="glow" 
            style={{ 
              width: index === count - 1 ? '60%' : width, 
              height: height,
              display: 'block',
              marginBottom: index < count - 1 ? '8px' : '0'
            }} 
          />
        ))}
      </div>
    );
  }

  // Circular skeleton - for profile pictures and avatars
  if (type === 'circular') {
    return (
      <div className="skeleton-circular-container">
        {Array.from({ length: count }).map((_, index) => (
          <Placeholder 
            key={index} 
            as="span" 
            animation="glow" 
            style={{ 
              width: width, 
              height: height,
              borderRadius: '50%'
            }} 
          />
        ))}
      </div>
    );
  }

  // Dashboard metrics skeleton
  if (type === 'metrics') {
    return (
      <div className="skeleton-metrics-container">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-metric-card">
            <Placeholder as="span" animation="glow" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            <Placeholder as="span" animation="glow" style={{ width: '80%', height: '28px' }} />
            <Placeholder as="span" animation="glow" style={{ width: '60%', height: '16px' }} />
          </div>
        ))}
      </div>
    );
  }

  // Default - simple skeleton
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <Placeholder 
          key={index} 
          as="span" 
          animation="glow" 
          style={{ width: width, height: height }} 
        />
      ))}
    </div>
  );
};

/**
 * Full page loading spinner
 */
export const PageLoader = () => (
  <div className="page-loader">
    <Spinner animation="border" variant="primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

/**
 * Inline loading spinner
 */
export const InlineLoader = ({ size = 'sm' }) => (
  <Spinner animation="border" variant="primary" size={size} role="status">
    <span className="visually-hidden">Loading...</span>
  </Spinner>
);

export default LoadingSkeleton;