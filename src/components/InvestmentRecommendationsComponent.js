import React, { useContext, useState } from 'react';
import { Card, Form, Badge, Button, ProgressBar, Accordion } from 'react-bootstrap';
import { TrendingUp, Target } from 'lucide-react';
import { generateInvestmentRecommendations, calculateTargetAllocation } from '../utils/investmentRecommendations';
import AssetContext from '../context/AssetContext';
import '../style/InvestmentRecommendations.css';

function InvestmentRecommendationsComponent() {
  const { portfolio } = useContext(AssetContext);
  const [userAge, setUserAge] = useState(35);
  const [riskTolerance, setRiskTolerance] = useState('moderate');
  const [recommendations, setRecommendations] = useState([]);

  const handleGenerateRecommendations = () => {
    try {
      const recs = generateInvestmentRecommendations(
        portfolio,
        userAge,
        riskTolerance
      );
      setRecommendations(recs);
    } catch (err) {
      console.error('Error generating recommendations:', err);
    }
  };

  const targetAllocation = calculateTargetAllocation(
    userAge,
    riskTolerance
  );

  // Calculate current allocation
  const calculateCurrentAllocation = () => {
    if (!portfolio || portfolio.length === 0) {
      return { stocks: 0, bonds: 0, crypto: 0, cash: 0, other: 0 };
    }

    const total = portfolio.reduce((sum, asset) => sum + (asset.value || 0), 0);
    if (total === 0) return { stocks: 0, bonds: 0, crypto: 0, cash: 0, other: 0 };

    const allocation = { stocks: 0, bonds: 0, crypto: 0, cash: 0, other: 0 };

    portfolio.forEach((asset) => {
      const pct = (asset.value / total) * 100;
      const type = asset.type?.toLowerCase() || '';

      if (
        type.includes('stock') ||
        type.includes('etf') ||
        type.includes('mutual')
      ) {
        allocation.stocks += pct;
      } else if (
        type.includes('bond') ||
        type.includes('treasury') ||
        type.includes('fixed')
      ) {
        allocation.bonds += pct;
      } else if (type.includes('crypto')) {
        allocation.crypto += pct;
      } else if (type.includes('cash') || type.includes('savings')) {
        allocation.cash += pct;
      } else {
        allocation.other += pct;
      }
    });

    return allocation;
  };

  const currentAllocation = calculateCurrentAllocation();

  const riskLevelDisplay = {
    conservative: 'Conservative (Low Risk)',
    moderate: 'Moderate (Balanced)',
    aggressive: 'Aggressive (High Risk)',
  };

  const getRiskColor = (risk) => {
    if (risk === 'conservative') return 'info';
    if (risk === 'aggressive') return 'danger';
    return 'warning';
  };

  return (
    <div className="investment-recommendations">
      <h4 className="mb-4">🎯 Investment Recommendations</h4>

      {/* Input Section */}
      <Card className="mb-4 input-section">
        <Card.Body>
          <div className="input-grid">
            <Form.Group>
              <Form.Label>Your Age</Form.Label>
              <Form.Control
                type="number"
                min="18"
                max="100"
                value={userAge}
                onChange={(e) => setUserAge(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Risk Tolerance</Form.Label>
              <Form.Select
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </Form.Select>
            </Form.Group>
          </div>

          <Button
            variant="primary"
            onClick={handleGenerateRecommendations}
            className="mt-3 w-100"
          >
            <Target size={16} className="me-2" />
            Generate Recommendations
          </Button>
        </Card.Body>
      </Card>

      {/* Target Allocation Card */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            📊 Recommended Allocation for Your Profile
          </h6>
        </Card.Header>
        <Card.Body>
          <p className="text-muted small mb-3">
            Based on {riskLevelDisplay[riskTolerance]} and age {userAge}
          </p>

          <div className="allocation-display">
            {Object.entries(targetAllocation).map(([type, percentage]) => (
              <div key={type} className="allocation-item">
                <div className="d-flex justify-content-between mb-2">
                  <span className="capitalize">{type}</span>
                  <strong>{percentage}%</strong>
                </div>
                <ProgressBar
                  now={percentage}
                  className={`allocation-bar allocation-${type}`}
                />
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Current vs Target Comparison */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">📈 Current vs Target Allocation</h6>
        </Card.Header>
        <Card.Body>
          <div className="comparison-grid">
            {['stocks', 'bonds', 'crypto', 'cash', 'other'].map((type) => (
              <div key={type} className="comparison-item">
                <h6 className="capitalize mb-3">{type}</h6>

                <div className="comparison-bars">
                  <div className="bar-container">
                    <p className="small text-muted mb-1">Current</p>
                    <ProgressBar
                      now={currentAllocation[type] || 0}
                      className={`allocation-bar allocation-${type}`}
                    />
                    <small className="text-muted">
                      {(currentAllocation[type] || 0).toFixed(1)}%
                    </small>
                  </div>

                  <div className="bar-container">
                    <p className="small text-muted mb-1">Target</p>
                    <ProgressBar
                      now={targetAllocation[type] || 0}
                      className={`allocation-bar allocation-${type}-target`}
                    />
                    <small className="text-muted">
                      {targetAllocation[type]}%
                    </small>
                  </div>
                </div>

                <Badge
                  bg={
                    Math.abs(
                      (currentAllocation[type] || 0) - targetAllocation[type]
                    ) < 5
                      ? 'success'
                      : 'warning'
                  }
                  className="mt-2"
                >
                  {((currentAllocation[type] || 0) - targetAllocation[type]).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <Card>
          <Card.Header>
            <h6 className="mb-0">💡 Action Items</h6>
          </Card.Header>
          <Card.Body>
            <Accordion defaultActiveKey="0">
              {recommendations.map((rec, idx) => (
                <Accordion.Item eventKey={idx.toString()} key={idx}>
                  <Accordion.Header className="recommendation-header">
                    <TrendingUp size={16} className="me-2" />
                    {rec.title}
                    <Badge bg="info" className="ms-2">
                      {rec.impact}
                    </Badge>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p className="mb-3">{rec.description}</p>
                    {rec.actions && (
                      <>
                        <h6>Suggested Actions:</h6>
                        <ul className="mb-0">
                          {rec.actions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default InvestmentRecommendationsComponent;
