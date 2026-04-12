import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Layers, AlertTriangle, CheckCircle, Target } from 'lucide-react';

const DiversificationScore = ({ assets }) => {
  
  const calculateDiversification = () => {
    // Get asset class values
    const assetClasses = [
      { name: 'Cash', value: assets.cash?.reduce((s, a) => s + parseFloat(a.amount || 0), 0) || 0, color: '#10B981' },
      { name: 'Stocks', value: assets.stocks?.reduce((s, a) => s + parseFloat(a.total || 0), 0) || 0, color: '#3B82F6' },
      { name: 'Bonds', value: assets.bonds?.reduce((s, a) => s + parseFloat(a.currentValue || 0), 0) || 0, color: '#8B5CF6' },
      { name: 'Real Estate', value: assets.properties?.reduce((s, a) => s + parseFloat(a.price || 0), 0) || 0, color: '#F59E0B' },
      { name: 'Metals', value: assets.metals?.reduce((s, a) => s + parseFloat(a.total || 0), 0) || 0, color: '#FBBF24' },
      { name: 'Crypto', value: assets.crypto?.reduce((s, a) => s + parseFloat(a.total || 0), 0) || 0, color: '#EF4444' },
      { name: 'Retirement', value: assets.retirement?.reduce((s, a) => s + parseFloat(a.currentBalance || 0), 0) || 0, color: '#06B6D4' },
      { name: 'Savings', value: assets.savings?.reduce((s, a) => s + parseFloat(a.currentBalance || 0), 0) || 0, color: '#14B8A6' },
      { name: 'Autos', value: assets.cars?.reduce((s, a) => s + parseFloat(a.value || 0), 0) || 0, color: '#6366F1' },
      { name: 'Custom', value: assets.customAssets?.reduce((s, a) => s + parseFloat(a.totalValue || 0), 0) || 0, color: '#EC4899' },
    ];

    const totalValue = assetClasses.reduce((sum, ac) => sum + ac.value, 0);
    const nonZeroClasses = assetClasses.filter(ac => ac.value > 0);
    
    // Calculate distribution percentages
    const percentages = nonZeroClasses.map(ac => ({
      ...ac,
      percentage: totalValue > 0 ? (ac.value / totalValue) * 100 : 0
    }));

    // Calculate diversification score 0-100
    const numberOfClasses = nonZeroClasses.length;
    const averageConcentration = nonZeroClasses.length > 0 
      ? nonZeroClasses.reduce((sum, ac) => sum + Math.abs((ac.value / totalValue) - (1 / numberOfClasses)), 0) / 2
      : 1;
    
    const distributionScore = Math.max(0, 100 - (averageConcentration * 100));
    const countScore = Math.min(numberOfClasses * 12.5, 100); // 8 classes = 100 points
    const overallScore = (distributionScore * 0.7) + (countScore * 0.3);

    // Find largest concentration
    const largest = percentages.length > 0 
      ? percentages.reduce((max, curr) => curr.percentage > max.percentage ? curr : max)
      : null;

    return {
      score: overallScore,
      totalValue,
      assetClasses: percentages,
      numberOfClasses,
      largestConcentration: largest,
      distributionScore,
      countScore
    };
  };

  const diversification = calculateDiversification();

  const getScoreStatus = (score) => {
    if (score >= 80) return { color: 'success', icon: CheckCircle, text: 'Excellent Diversification', recommendation: 'Well diversified across asset classes' };
    if (score >= 60) return { color: 'success', icon: CheckCircle, text: 'Good Diversification', recommendation: 'Good balance, minor improvements possible' };
    if (score >= 40) return { color: 'primary', icon: CheckCircle, text: 'Moderate Diversification', recommendation: 'Consider adding more asset classes' };
    return { color: 'info', icon: CheckCircle, text: 'Building Diversification', recommendation: 'Add more asset classes to improve score' };
  };

  const status = getScoreStatus(diversification.score);
  const StatusIcon = status.icon;

  return (
    <Card className="diversification-score-card">
      <Card.Body>
        <h3 className="mb-4">
          <Layers size={24} className="me-2 text-primary" />
          Portfolio Diversification Score
        </h3>

        <div className="text-center mb-4">
          <div className={`diversification-score-circle text-${status.color}`}>
            <StatusIcon size={48} className="mb-2" />
            <div className="score-value">{diversification.score.toFixed(0)}</div>
            <div className="score-label">/ 100</div>
          </div>
          <h4 className={`mt-3 text-${status.color}`}>{status.text}</h4>
          <p className="text-muted mt-2">{status.recommendation}</p>
        </div>

        {diversification.assetClasses.length > 0 && (
          <div className="mb-4">
            <h5>Asset Allocation</h5>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diversification.assetClasses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                  >
                    {diversification.assetClasses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(0)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {diversification.largestConcentration && (
          <div className="mt-4">
            <h5>
              <Target size={18} className="me-2" />
              Concentration Risk
            </h5>
            <div className="concentration-warning p-3 rounded">
              <div className="d-flex justify-content-between align-items-center">
                <span>Largest Holding: {diversification.largestConcentration.name}</span>
                <span className="fw-bold">{diversification.largestConcentration.percentage.toFixed(1)}%</span>
              </div>
              <ProgressBar 
                now={diversification.largestConcentration.percentage} 
                max={100}
                variant={diversification.largestConcentration.percentage > 40 ? 'primary' : diversification.largestConcentration.percentage > 25 ? 'info' : 'success'}
                className="mt-2"
              />
              {diversification.largestConcentration.percentage > 25 && (
                <p className="text-muted small mt-2">
                  Ideal allocation is below 25% per asset class for optimal diversification
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h5>Diversification Breakdown</h5>
          <div className="row text-center g-2">
            <div className="col-6">
              <div className="small text-muted">Asset Classes Held</div>
              <div className="fw-bold h5">{diversification.numberOfClasses}</div>
            </div>
            <div className="col-6">
              <div className="small text-muted">Distribution Score</div>
              <div className="fw-bold h5">{diversification.distributionScore.toFixed(0)}%</div>
            </div>
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default DiversificationScore;