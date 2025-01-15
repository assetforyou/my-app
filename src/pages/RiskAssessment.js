import React from 'react';
import { Card } from 'react-bootstrap';
import {
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const RiskAssessment = ({ cashList, stockList, metalList, propertyList }) => {
  const calculateVolatilityMetrics = () => {
    // Calculate basic volatility scores (0-100) for each asset class
    const volatilityScores = [
      {
        category: 'Cash',
        volatility: 10,
        liquidity: 95,
        marketRisk: 5,
        value: cashList.reduce((total, cash) => total + parseFloat(cash.amount || 0), 0)
      },
      {
        category: 'Stocks',
        volatility: 75,
        liquidity: 90,
        marketRisk: 80,
        value: stockList.reduce((total, stock) => total + parseFloat(stock.total || 0), 0)
      },
      {
        category: 'Metals',
        volatility: 60,
        liquidity: 70,
        marketRisk: 65,
        value: metalList.reduce((total, metal) => total + parseFloat(metal.total || 0), 0)
      },
      {
        category: 'Properties',
        volatility: 40,
        liquidity: 20,
        marketRisk: 50,
        value: propertyList.reduce((total, property) => total + parseFloat(property.price || 0), 0)
      }
    ];

    return volatilityScores;
  };

  const riskMetrics = calculateVolatilityMetrics();
  
  const calculateStressScenarios = () => {
    const total = riskMetrics.reduce((sum, asset) => sum + asset.value, 0);
    const scenarios = [
      { name: 'Market Crash', impact: -25 },
      { name: 'Inflation Spike', impact: -15 },
      { name: 'Interest Rate Hike', impact: -10 },
      { name: 'Currency Crisis', impact: -20 },
      { name: 'Recovery', impact: 15 }
    ].map(scenario => ({
      ...scenario,
      portfolioValue: total * (1 + scenario.impact / 100)
    }));
    return scenarios;
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Risk Assessment Dashboard</h5>
      </Card.Header>
      <Card.Body>
        <div className="row">
          <div className="col-md-6">
            <h6>Portfolio Risk Radar</h6>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={riskMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Volatility" dataKey="volatility" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Liquidity" dataKey="liquidity" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Radar name="Market Risk" dataKey="marketRisk" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="col-md-6">
            <h6>Stress Test Scenarios</h6>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={calculateStressScenarios()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="portfolioValue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RiskAssessment;