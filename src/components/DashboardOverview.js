import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Badge } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Users, Target, AlertTriangle } from 'lucide-react';
import '../style/DashboardOverview.css';

const DashboardOverview = ({ 
  cashTotal, 
  stockTotal, 
  metalTotal, 
  propertyTotalPrice, 
  cryptoTotal, 
  loanTotal,
  customAssets,
  userEmail 
}) => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1M');
  const [portfolioData, setPortfolioData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate totals
  const totalAssets = cashTotal + stockTotal + metalTotal + propertyTotalPrice + cryptoTotal + customAssets.reduce((sum, asset) => sum + parseFloat(asset.totalValue || 0), 0);
  const totalLiabilities = loanTotal;
  const netWorth = totalAssets - totalLiabilities;

  // Asset allocation data
  const assetAllocation = [
    { name: 'Cash', value: cashTotal, color: '#3b82f6' },
    { name: 'Stocks', value: stockTotal, color: '#10b981' },
    { name: 'Metals', value: metalTotal, color: '#f59e0b' },
    { name: 'Property', value: propertyTotalPrice, color: '#8b5cf6' },
    { name: 'Crypto', value: cryptoTotal, color: '#ef4444' },
    { name: 'Custom', value: customAssets.reduce((sum, asset) => sum + parseFloat(asset.totalValue || 0), 0), color: '#06b6d4' },
  ].filter(item => item.value > 0);

  // Performance data (mock for now, would come from API)
  const generatePerformanceData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      value: Math.floor(Math.random() * 5000) + 10000,
      change: (Math.random() - 0.5) * 2000
    }));
  };

  useEffect(() => {
    setPerformanceData(generatePerformanceData());
  }, [timeRange]);

  const handleAssetClick = (assetType) => {
    const assetMap = {
      'Cash': 'cash',
      'Stocks': 'stocks', 
      'Metals': 'metals',
      'Property': 'property',
      'Crypto': 'crypto'
    };
    
    if (assetMap[assetType]) {
      navigate('/landing');
      // Dispatch event to navigate to specific asset
      window.dispatchEvent(new CustomEvent('vaultknight-navigate', { 
        detail: { action: assetMap[assetType] } 
      }));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPerformanceColor = (value) => {
    return value >= 0 ? '#10b981' : '#ef4444';
  };

  return (
    <div className="dashboard-overview">
      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="metric-card" onClick={() => navigate('/landing')}>
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
        
        <Col md={3}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon positive">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <h4>+{formatCurrency(Math.floor(Math.random() * 5000) + 1000)}</h4>
                <p className="metric-label">This Month</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon negative">
                <TrendingDown size={24} />
              </div>
              <div className="metric-content">
                <h4>{formatCurrency(loanTotal)}</h4>
                <p className="metric-label">Total Liabilities</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="metric-card">
            <Card.Body>
              <div className="metric-icon">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <h4>{customAssets.length + 6}</h4>
                <p className="metric-label">Asset Classes</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        {/* Asset Allocation Pie Chart */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Asset Allocation</h5>
                <div className="time-range-selector">
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="form-select form-select-sm"
                  >
                    <option value="1M">1 Month</option>
                    <option value="3M">3 Months</option>
                    <option value="6M">6 Months</option>
                    <option value="1Y">1 Year</option>
                  </select>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
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
                    <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                    <span className="legend-value">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Performance Chart */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Portfolio Performance</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Portfolio Value" />
                    <Bar dataKey="change" fill="#10b981" name="Monthly Change" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Goals and Alerts */}
      <Row>
        {/* Goals Progress */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Financial Goals</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    navigate('/landing');
                    window.dispatchEvent(new CustomEvent('vaultknight-navigate', { 
                      detail: { action: 'analytics' } 
                    }));
                  }}
                >
                  View All Goals
                </button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="goals-list">
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="goal-title">
                      <Target size={16} className="me-2" />
                      Emergency Fund
                    </div>
                    <span className="goal-amount">{formatCurrency(25000)} / {formatCurrency(50000)}</span>
                  </div>
                  <ProgressBar 
                    now={(25000 / 50000) * 100} 
                    variant="success" 
                    className="mb-2"
                  />
                  <small className="text-muted">Target: December 2024</small>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="goal-title">
                      <Target size={16} className="me-2" />
                      Retirement Fund
                    </div>
                    <span className="goal-amount">{formatCurrency(150000)} / {formatCurrency(1000000)}</span>
                  </div>
                  <ProgressBar 
                    now={(150000 / 1000000) * 100} 
                    variant="info" 
                    className="mb-2"
                  />
                  <small className="text-muted">Target: 2040</small>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="goal-title">
                      <Target size={16} className="me-2" />
                      Property Down Payment
                    </div>
                    <span className="goal-amount">{formatCurrency(45000)} / {formatCurrency(80000)}</span>
                  </div>
                  <ProgressBar 
                    now={(45000 / 80000) * 100} 
                    variant="warning" 
                    className="mb-2"
                  />
                  <small className="text-muted">Target: June 2025</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Alerts and Recommendations */}
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Insights & Alerts</h5>
            </Card.Header>
            <Card.Body>
              <div className="alerts-list">
                <div className="alert-item warning">
                  <AlertTriangle size={16} className="me-2" />
                  <div>
                    <strong>High Loan-to-Value Ratio</strong>
                    <p>Your loan balance is 45% of your total assets. Consider refinancing options.</p>
                  </div>
                </div>
                
                <div className="alert-item info">
                  <TrendingUp size={16} className="me-2" />
                  <div>
                    <strong>Stock Performance</strong>
                    <p>Your stock portfolio increased by 12% this quarter. Consider rebalancing.</p>
                  </div>
                </div>
                
                <div className="alert-item success">
                  <TrendingUp size={16} className="me-2" />
                  <div>
                    <strong>Emergency Fund Progress</strong>
                    <p>You're 50% towards your emergency fund goal. Keep up the good work!</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3">
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/landing')}>
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