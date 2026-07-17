import React, { useState, useContext } from 'react';
import { Card, Form, Button, Badge, ListGroup } from 'react-bootstrap';
import { TrendingDown, Calculator } from 'lucide-react';
import { calculateDebtPayoffScenario, comparePayoffScenarios } from '../utils/debtPayoffCalculator';
import AssetContext from '../context/AssetContext';
import '../style/DebtPayoffScenario.css';

function DebtPayoffScenario() {
  const { portfolio } = useContext(AssetContext);
  const [debtAmount, setDebtAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [monthlyPayment, setMonthlyPayment] = useState(250);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);

  const handleCalculate = () => {
    if (!debtAmount || debtAmount <= 0) {
      alert('Please enter a valid debt amount');
      return;
    }
    if (!monthlyPayment || monthlyPayment <= 0) {
      alert('Please enter a valid monthly payment');
      return;
    }
    if (interestRate < 0) {
      alert('Interest rate cannot be negative');
      return;
    }
    
    try {
      const baseScenario = calculateDebtPayoffScenario(
        debtAmount,
        interestRate,
        monthlyPayment
      );
      const comparisons = comparePayoffScenarios(
        debtAmount,
        interestRate,
        monthlyPayment
      );

      setScenarios([baseScenario, ...comparisons]);
      setActiveScenario(0);
    } catch (err) {
      console.error('Error calculating scenarios:', err);
      alert('Error calculating payoff scenarios. Please check your values.');
    }
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const basePrincipal = debtAmount;
  const extraPaymentIncrements = [50, 100, 200, 500];

  return (
    <div className="debt-payoff-scenario">
      <h4 className="mb-4">💳 Debt Payoff Calculator</h4>

      {/* Input Form */}
      <Card className="mb-4 input-card">
        <Card.Body>
          <div className="form-grid">
            <Form.Group>
              <Form.Label>Total Debt Amount</Form.Label>
              <Form.Control
                type="number"
                value={debtAmount}
                onChange={(e) => setDebtAmount(Number(e.target.value))}
                placeholder="0"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Interest Rate (%)</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                placeholder="0"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Monthly Payment ($)</Form.Label>
              <Form.Control
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                placeholder="0"
              />
            </Form.Group>
          </div>

          <Button
            variant="primary"
            onClick={handleCalculate}
            className="mt-3 w-100"
          >
            <Calculator size={16} className="me-2" />
            Calculate Payoff Scenarios
          </Button>
        </Card.Body>
      </Card>

      {/* Scenarios Display */}
      {scenarios.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="scenarios-summary mb-4">
            {scenarios.map((scenario, idx) => (
              <Card
                key={idx}
                className={`scenario-card ${activeScenario === idx ? 'active' : ''}`}
                onClick={() => setActiveScenario(idx)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <h6 className="mb-2 text-nowrap">
                    {scenario.extraPayment > 0
                      ? `+$${scenario.extraPayment}/mo`
                      : 'Base Payment'}
                  </h6>
                  <p className="mb-1 small text-muted">Payoff Time</p>
                  <h5 className="mb-3">
                    {scenario.months}
                    <small className="text-muted ms-1">months</small>
                  </h5>
                  <p className="mb-0 small text-muted">Total Interest</p>
                  <h6 className="text-danger">${scenario.totalInterestPaid?.toLocaleString?.() || 0}</h6>
                </Card.Body>
              </Card>
            ))}
          </div>

          {/* Active Scenario Details */}
          {activeScenario !== null && scenarios[activeScenario] && (
            <Card className="mb-4 details-card">
              <Card.Header>
                <h6 className="mb-0">
                  Scenario: {scenarios[activeScenario].extraPayment > 0
                    ? `+$${scenarios[activeScenario].extraPayment}/month extra`
                    : 'Base scenario'}
                </h6>
              </Card.Header>
              <Card.Body>
                <div className="scenario-details">
                  <div className="detail-row">
                    <span>Original Debt</span>
                    <strong>{formatCurrency(debtAmount)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Monthly Payment</span>
                    <strong>
                      {formatCurrency(monthlyPayment + (scenarios[activeScenario].extraPayment || 0))}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Interest Rate</span>
                    <strong>{interestRate}%</strong>
                  </div>
                  <div className="divider"></div>
                  <div className="detail-row highlight">
                    <span>Payoff Time</span>
                    <strong className="text-success">
                      {scenarios[activeScenario].months} months
                      <small className="ms-2 text-muted">
                        ({Math.floor(scenarios[activeScenario].months / 12)} years)
                      </small>
                    </strong>
                  </div>
                  <div className="detail-row highlight">
                    <span>Total Interest Paid</span>
                    <strong className="text-danger">
                      {formatCurrency(scenarios[activeScenario].totalInterestPaid || 0)}
                    </strong>
                  </div>
                  <div className="detail-row highlight">
                    <span>Total Paid (Principal + Interest)</span>
                    <strong className="text-primary">
                      {formatCurrency(debtAmount + (scenarios[activeScenario].totalInterestPaid || 0))}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Comparison Table */}
          <Card>
            <Card.Header>
              <h6 className="mb-0">💡 Payoff Strategy Comparison</h6>
            </Card.Header>
            <Card.Body>
              <div className="comparison-table">
                <div className="table-header">
                  <div className="col col-payment">Monthly Payment</div>
                  <div className="col col-months">Payoff Time</div>
                  <div className="col col-interest">Total Interest</div>
                  <div className="col col-savings">Interest Saved</div>
                </div>

                {scenarios.map((scenario, idx) => (
                  <div
                    key={idx}
                    className={`table-row ${activeScenario === idx ? 'active' : ''}`}
                  >
                    <div className="col col-payment">
                      {formatCurrency(monthlyPayment + (scenario.extraPayment || 0))}
                    </div>
                    <div className="col col-months">
                      {scenario.months}
                      <span className="text-muted small"> mo</span>
                    </div>
                    <div className="col col-interest">
                      {formatCurrency(scenario.totalInterestPaid || 0)}
                    </div>
                    <div className="col col-savings">
                      {idx === 0 ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <Badge bg="success">
                          {formatCurrency(
                            (scenarios[0].totalInterestPaid || 0) - (scenario.totalInterestPaid || 0)
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Recommendation */}
          <Card className="mt-4 recommendation-card">
            <Card.Body>
              <h6 className="mb-2">📈 Recommendation</h6>
              <p className="mb-0 small">
                {scenarios[1]
                  ? `If you can afford an extra $50/month, you'll save 
                    ${formatCurrency((scenarios[0].totalInterestPaid || 0) - (scenarios[1].totalInterestPaid || 0))} 
                    in interest and pay off the debt approximately 
                    ${(scenarios[0].months || 0) - (scenarios[1].months || 0)} months faster.`
                  : 'Focus on increasing your monthly payment to reduce interest paid.'}
              </p>
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

export default DebtPayoffScenario;
