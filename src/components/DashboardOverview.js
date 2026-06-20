import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingDown, Layers, BarChart3, Target } from 'lucide-react';
import {
  calculatePortfolioTotals,
  formatCurrency,
  generatePortfolioInsights,
} from '../utils/portfolioUtils';
import EmptyState from './EmptyState';
import '../style/DashboardOverview.css';
import '../style/EmptyState.css';

const DashboardOverview = ({
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
  onNavigate,
}) => {
  const portfolio = calculatePortfolioTotals({
    cashTotal,
    stockTotal,
    metalTotal,
    propertyTotalPrice,
    cryptoTotal,
    autoTotal,
    bondTotal,
    retirementTotal,
    savingsTotal,
    commoditiesTotal,
    artCollectiblesTotal,
    luxuryWatchesTotal,
    privateEquityTotal,
    intellectualPropertyTotal,
    loanTotal,
    customAssets,
  });

  const { netWorth, totalAssets, totalLiabilities, activeCategories, assetAllocation } = portfolio;
  const insights = generatePortfolioInsights({ netWorth, totalAssets, loanTotal, assetAllocation });
  const hasData = totalAssets > 0 || loanTotal > 0;

  const handleAssetClick = (assetType) => {
    const assetMap = {
      Cash: 'cash',
      Stocks: 'stocks',
      Metals: 'metals',
      Property: 'property',
      Crypto: 'crypto',
      Autos: 'auto',
      Bonds: 'bonds',
      Retirement: 'retirement',
      Savings: 'savings',
      Commodities: 'commodities',
      'Art & Collectibles': 'artCollectibles',
      'Luxury Watches': 'luxuryWatches',
      'Private Equity': 'privateEquity',
      'Intellectual Property': 'intellectualProperty',
    };
    if (assetMap[assetType]) {
      onNavigate?.(assetMap[assetType]);
    }
  };

  if (!hasData) {
    return (
      <EmptyState
        title="Your dashboard is ready"
        description="Add assets to see net worth, allocation charts, and personalized insights — all based on your real data."
        actions={[
          { label: 'Add an asset', primary: true, onClick: () => onNavigate?.('cash') },
          { label: 'View all assets', onClick: () => onNavigate?.('home') },
        ]}
      />
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="vk-net-worth-hero">
        <p className="vk-net-worth-hero__label">Net Worth</p>
        <p className="vk-net-worth-hero__value">{formatCurrency(netWorth)}</p>
        <p className="vk-net-worth-hero__sub">
          <span>{formatCurrency(totalAssets)}</span> assets ·{' '}
          <span>{formatCurrency(totalLiabilities)}</span> liabilities
        </p>
      </div>

      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="metric-card" onClick={() => onNavigate?.('home')}>
            <Card.Body>
              <div className="metric-icon">
                <DollarSign size={24} />
              </div>
              <div className="metric-content">
                <h4>{formatCurrency(netWorth)}</h4>
                <p className="metric-label">Net Worth</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="metric-card" onClick={() => onNavigate?.('home')}>
            <Card.Body>
              <div className="metric-icon positive">
                <Layers size={24} />
              </div>
              <div className="metric-content">
                <h4>{formatCurrency(totalAssets)}</h4>
                <p className="metric-label">Total Assets</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="metric-card" onClick={() => onNavigate?.('loan')}>
            <Card.Body>
              <div className="metric-icon negative">
                <TrendingDown size={24} />
              </div>
              <div className="metric-content">
                <h4>{formatCurrency(totalLiabilities)}</h4>
                <p className="metric-label">Total Liabilities</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon">
                <Target size={24} />
              </div>
              <div className="metric-content">
                <h4>{activeCategories}</h4>
                <p className="metric-label">Asset Classes</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Asset Allocation</h5>
            </Card.Header>
            <Card.Body>
              {assetAllocation.length > 0 ? (
                <>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={assetAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {assetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="allocation-legend">
                    {assetAllocation.map((item, index) => (
                      <div key={index} className="legend-item" onClick={() => handleAssetClick(item.name)}>
                        <div className="legend-color" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                        <span className="legend-value">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted mb-0">Add assets to see allocation.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Portfolio History</h5>
            </Card.Header>
            <Card.Body>
              <div className="dashboard-placeholder-chart">
                <BarChart3 size={40} strokeWidth={1.25} />
                <p>Performance charts appear after your first daily snapshot is recorded.</p>
                <small>We save your net worth automatically each day you visit.</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Goals</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onNavigate?.('analytics')}
                >
                  Set goals in Analytics
                </button>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-0">
                Track financial goals in Advanced Analysis. Your progress will reflect real portfolio values.
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Insights</h5>
            </Card.Header>
            <Card.Body>
              <div className="alerts-list">
                {insights.map((insight, index) => (
                  <div key={index} className={`alert-item ${insight.type}`}>
                    <div>
                      <strong>{insight.title}</strong>
                      <p>{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => onNavigate?.('analytics')}>
                  View Detailed Analysis
                </button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
