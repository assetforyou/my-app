import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';

const DividendIncome = ({ stockList = [], etfList = [], bondList = [] }) => {
  
  // Calculate dividend income
  const calculateDividends = () => {
    let monthlyDividends = 0;
    let annualDividends = 0;
    let yieldOnCost = 0;
    let totalCostBasis = 0;

    // Process stocks
    stockList.forEach(stock => {
      const shares = parseFloat(stock.shares) || 0;
      const price = parseFloat(stock.price) || 0;
      const dividend = parseFloat(stock.dividendYield || 0) / 100;
      const total = shares * price;
      
      totalCostBasis += total;
      annualDividends += total * dividend;
    });

    // Process ETFs
    etfList.forEach(etf => {
      const shares = parseFloat(etf.shares) || 0;
      const price = parseFloat(etf.currentPrice) || 0;
      const dividend = parseFloat(etf.dividendYield || 0) / 100;
      const total = shares * price;
      
      totalCostBasis += total;
      annualDividends += total * dividend;
    });

    // Process bonds
    bondList.forEach(bond => {
      const value = parseFloat(bond.currentValue) || 0;
      const coupon = parseFloat(bond.couponRate || 0) / 100;
      
      totalCostBasis += value;
      annualDividends += value * coupon;
    });

    monthlyDividends = annualDividends / 12;
    yieldOnCost = totalCostBasis > 0 ? (annualDividends / totalCostBasis) * 100 : 0;

    return {
      monthly: monthlyDividends,
      annual: annualDividends,
      yieldOnCost,
      totalCostBasis
    };
  };

  const dividends = calculateDividends();

  // Monthly goal progress
  const MONTHLY_GOALS = [100, 500, 1000, 2500, 5000, 10000];
  const currentGoalIndex = MONTHLY_GOALS.findIndex(goal => dividends.monthly < goal);
  const nextGoal = currentGoalIndex >= 0 ? MONTHLY_GOALS[currentGoalIndex] : MONTHLY_GOALS[MONTHLY_GOALS.length - 1];
  const previousGoal = currentGoalIndex > 0 ? MONTHLY_GOALS[currentGoalIndex - 1] : 0;
  const progressPercent = nextGoal > 0 ? Math.min((dividends.monthly / nextGoal) * 100, 100) : 0;

  return (
    <Card className="dividend-income-card">
      <Card.Body>
        <h3 className="mb-4">
          <TrendingUp size={24} className="me-2 text-success" />
          Dividend & Passive Income
        </h3>

        <div className="row g-4">
          <div className="col-md-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <DollarSign size={28} className="text-success" />
                <div>
                  <div className="stat-label">Monthly Passive Income</div>
                  <div className="stat-value text-success">${dividends.monthly.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <Calendar size={28} className="text-primary" />
                <div>
                  <div className="stat-label">Annual Passive Income</div>
                  <div className="stat-value text-primary">${dividends.annual.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <Target size={28} className="text-info" />
                <div>
                  <div className="stat-label">Portfolio Yield on Cost</div>
                  <div className="stat-value text-info">{dividends.yieldOnCost.toFixed(2)}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="stat-card">
              <div className="d-flex align-items-center gap-3">
                <TrendingUp size={28} className="text-warning" />
                <div>
                  <div className="stat-label">Daily Passive Income</div>
                  <div className="stat-value text-warning">${(dividends.annual / 365).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h5>Monthly Goal Progress</h5>
          <div className="goal-progress-container">
            <div className="d-flex justify-content-between mb-2">
              <span>${previousGoal.toFixed(0)}</span>
              <strong>${dividends.monthly.toFixed(2)} / ${nextGoal.toFixed(0)}</strong>
              <span>${nextGoal.toFixed(0)}</span>
            </div>
            <ProgressBar 
              now={progressPercent} 
              variant="success"
              className="dividend-progress-bar"
            />
            <p className="text-muted mt-2 small">
              You are {progressPercent.toFixed(1)}% to your next monthly passive income milestone
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h5>Financial Independence Timeline</h5>
          <div className="row text-center g-3">
            <div className="col-3">
              <div className="small text-muted">At $1k/mo</div>
              <div className="fw-bold">${((1000 / dividends.monthly) * 100).toFixed(0)}%</div>
            </div>
            <div className="col-3">
              <div className="small text-muted">At $2.5k/mo</div>
              <div className="fw-bold">${((2500 / dividends.monthly) * 100).toFixed(0)}%</div>
            </div>
            <div className="col-3">
              <div className="small text-muted">At $5k/mo</div>
              <div className="fw-bold">${((5000 / dividends.monthly) * 100).toFixed(0)}%</div>
            </div>
            <div className="col-3">
              <div className="small text-muted">At $10k/mo</div>
              <div className="fw-bold">${((10000 / dividends.monthly) * 100).toFixed(0)}%</div>
            </div>
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default DividendIncome;