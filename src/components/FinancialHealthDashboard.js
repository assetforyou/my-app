import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, ProgressBar } from 'react-bootstrap';
import { TrendingUp, Wallet, AlertCircle, Target } from 'lucide-react';
import { calculateFinancialHealthScore, getScoreColor } from '../utils/financialHealthCalculator';
import ExpenseService from '../utils/expenseService';
import '../style/FinancialHealth.css';

function FinancialHealthDashboard({ portfolio, monthlyIncome, monthlyExpenses, userEmail }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState(monthlyIncome || 0);
  const [expenses, setExpenses] = useState(monthlyExpenses || 0);

  useEffect(() => {
    calculateHealth();
  }, [portfolio, income, expenses]);

  const calculateHealth = async () => {
    try {
      setLoading(true);
      
      // If we don't have income/expenses but have userEmail, fetch from ExpenseService
      let finalIncome = income;
      let finalExpenses = expenses;
      
      if (userEmail && (income === 0 || expenses === 0)) {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        try {
          const expList = await ExpenseService.fetchExpenses(userEmail, startDate, endDate);
          const incList = await ExpenseService.fetchIncome(userEmail, startDate, endDate);
          
          finalExpenses = expList.reduce((sum, e) => sum + (e.amount || 0), 0);
          finalIncome = incList.reduce((sum, i) => sum + (i.amount || 0), 0);
        } catch (err) {
          console.warn('Could not fetch expense/income data:', err);
        }
      }
      
      if (portfolio && portfolio.length > 0) {
        const data = calculateFinancialHealthScore(portfolio, finalIncome, finalExpenses);
        setHealthData(data);
        setIncome(finalIncome);
        setExpenses(finalExpenses);
      }
    } catch (err) {
      console.error('Error calculating health:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-muted">Calculating financial health...</p>;
  if (!healthData) return <Card className="p-4 text-center text-muted"><p>Add assets to your portfolio to calculate your financial health score.</p></Card>;

  const scoreColor = getScoreColor(healthData.score);

  return (
    <div className="financial-health-dashboard">
      {/* Score Card */}
      <Card className="score-card mb-4">
        <Card.Body className="text-center">
          <div className="score-circle" style={{ borderColor: scoreColor.color }}>
            <div className="score-number" style={{ color: scoreColor.color }}>
              {healthData.score}
            </div>
            <div className="score-label">{scoreColor.label}</div>
          </div>
          <h5 className="mt-3">Financial Health Score</h5>
          <p className="text-muted">Your overall financial wellness</p>
        </Card.Body>
      </Card>

      {/* Key Metrics */}
      <div className="metrics-grid mb-4">
        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <TrendingUp size={20} />
              <span>Savings Rate</span>
            </div>
            <div className="metric-value">{healthData.savingsRate}%</div>
            <small className="text-muted">Target: 20%+</small>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <Wallet size={20} />
              <span>Emergency Fund</span>
            </div>
            <div className="metric-value">{healthData.emergencyFundMonths} mo</div>
            <small className="text-muted">Target: 3-6 months</small>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <AlertCircle size={20} />
              <span>Debt Ratio</span>
            </div>
            <div className="metric-value">{healthData.debtToIncomeRatio.toFixed(1)}x</div>
            <small className="text-muted">Target: &lt;1x</small>
          </Card.Body>
        </Card>

        <Card className="metric-card">
          <Card.Body>
            <div className="metric-header">
              <Target size={20} />
              <span>Net Worth</span>
            </div>
            <div className="metric-value">${(healthData.netWorth / 1000).toFixed(0)}k</div>
            <small className="text-muted">{healthData.netWorth > 0 ? 'Positive' : 'Negative'}</small>
          </Card.Body>
        </Card>
      </div>

      {/* Achievements */}
      {healthData.achievements.length > 0 && (
        <Card className="mb-4">
          <Card.Header>✅ Achievements</Card.Header>
          <Card.Body>
            <ul className="list-unstyled">
              {healthData.achievements.map((a, i) => (
                <li key={i} className="mb-2">
                  <span style={{ color: '#10b981' }}>✓</span> {a}
                </li>
              ))}
            </ul>
          </Card.Body>
        </Card>
      )}

      {/* Recommendations */}
      {healthData.recommendations.length > 0 && (
        <Card>
          <Card.Header>💡 Top Actions</Card.Header>
          <Card.Body>
            <ol className="list-styled">
              {healthData.recommendations.map((r, i) => (
                <li key={i} className="mb-2">
                  {r}
                </li>
              ))}
            </ol>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default FinancialHealthDashboard;
