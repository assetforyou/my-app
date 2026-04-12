import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { Droplets, Clock, ShieldAlert, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const LiquidityScore = ({ assets }) => {
  
  // Liquidity tiers by asset type (days to convert to cash)
  const LIQUIDITY_TIERS = {
    cash: { days: 0, score: 100, name: 'Instant' },
    crypto: { days: 1, score: 95, name: '24 Hours' },
    stocks: { days: 3, score: 90, name: '3 Days' },
    etfs: { days: 3, score: 90, name: '3 Days' },
    metals: { days: 7, score: 75, name: '1 Week' },
    bonds: { days: 14, score: 65, name: '2 Weeks' },
    auto: { days: 30, score: 40, name: '30 Days' },
    property: { days: 180, score: 10, name: '6+ Months' },
    custom: { days: 60, score: 30, name: '60 Days' },
    loan: { days: 0, score: 0, name: 'Liability' },
  };

  const calculateLiquidity = () => {
    let totalValue = 0;
    let weightedLiquidity = 0;
    let liquidityBreakdown = [];
    let instantAccess = 0;
    let oneWeekAccess = 0;
    let thirtyDayAccess = 0;
    let longTerm = 0;

    // Calculate total portfolio value
    Object.entries(assets).forEach(([type, assetList]) => {
      assetList.forEach(asset => {
        let value = 0;
        
        // Get value based on asset type
        switch(type) {
          case 'cash': value = parseFloat(asset.amount) || 0; break;
          case 'stocks': value = parseFloat(asset.total) || 0; break;
          case 'crypto': value = parseFloat(asset.total) || 0; break;
          case 'metals': value = parseFloat(asset.total) || 0; break;
          case 'properties': value = parseFloat(asset.price) || 0; break;
          case 'cars': value = parseFloat(asset.value) || 0; break;
          case 'loans': value = parseFloat(asset.loanValue) || 0; break;
          case 'bonds': value = parseFloat(asset.currentValue) || 0; break;
          case 'etfs': value = parseFloat(asset.total) || 0; break;
          case 'customAssets': value = parseFloat(asset.value) || 0; break;
          default: value = 0;
        }

        if (value > 0) {
          const tier = LIQUIDITY_TIERS[type.replace(/s$/, '')] || LIQUIDITY_TIERS.custom;
          totalValue += value;
          weightedLiquidity += value * tier.score;

          // Categorize by liquidity time
          if (tier.days <= 1) instantAccess += value;
          else if (tier.days <= 7) oneWeekAccess += value;
          else if (tier.days <= 30) thirtyDayAccess += value;
          else longTerm += value;

          liquidityBreakdown.push({
            type,
            value,
            ...tier
          });
        }
      });
    });

    const overallScore = totalValue > 0 ? weightedLiquidity / totalValue : 0;
    
    // Emergency fund calculation (6 months expenses)
    const monthlyExpensesEstimate = totalValue * 0.03; // Assume 3% monthly spend
    const emergencyFundNeeded = monthlyExpensesEstimate * 6;
    const emergencyFundCoverage = emergencyFundNeeded > 0 ? (instantAccess / emergencyFundNeeded) * 100 : 0;

    return {
      overallScore,
      totalValue,
      instantAccess,
      oneWeekAccess,
      thirtyDayAccess,
      longTerm,
      emergencyFundCoverage,
      monthlyExpensesEstimate,
      liquidityBreakdown
    };
  };

  const liquidity = calculateLiquidity();

  // Get score indicator
  const getScoreStatus = (score) => {
    if (score >= 80) return { color: 'success', icon: CheckCircle, text: 'Excellent' };
    if (score >= 60) return { color: 'info', icon: CheckCircle, text: 'Good' };
    if (score >= 40) return { color: 'warning', icon: AlertTriangle, text: 'Moderate' };
    return { color: 'danger', icon: XCircle, text: 'Low' };
  };

  const status = getScoreStatus(liquidity.overallScore);
  const StatusIcon = status.icon;

  return (
    <Card className="liquidity-score-card">
      <Card.Body>
        <h3 className="mb-4">
          <Droplets size={24} className="me-2 text-primary" />
          Portfolio Liquidity Score
        </h3>

        {/* Overall Score */}
        <div className="text-center mb-4">
          <div className={`liquidity-score-circle text-${status.color}`}>
            <StatusIcon size={48} className="mb-2" />
            <div className="score-value">{liquidity.overallScore.toFixed(0)}</div>
            <div className="score-label">/ 100</div>
          </div>
          <h4 className={`mt-3 text-${status.color}`}>{status.text} Liquidity</h4>
        </div>

        {/* Liquidity Breakdown */}
        <div className="mt-4">
          <h5>Liquidity Breakdown</h5>
          
          <div className="liquidity-bar-container mb-3">
            <div 
              className="liquidity-bar-segment bg-success"
              style={{ width: `${(liquidity.instantAccess / liquidity.totalValue) * 100}%` }}
              title="Instant Access"
            />
            <div 
              className="liquidity-bar-segment bg-info"
              style={{ width: `${(liquidity.oneWeekAccess / liquidity.totalValue) * 100}%` }}
              title="1 Week"
            />
            <div 
              className="liquidity-bar-segment bg-warning"
              style={{ width: `${(liquidity.thirtyDayAccess / liquidity.totalValue) * 100}%` }}
              title="30 Days"
            />
            <div 
              className="liquidity-bar-segment bg-danger"
              style={{ width: `${(liquidity.longTerm / liquidity.totalValue) * 100}%` }}
              title="Long Term"
            />
          </div>

          <div className="row text-center g-2 mt-3">
            <div className="col-3">
              <div className="small text-success fw-bold">Instant</div>
              <div className="fw-bold">${liquidity.instantAccess.toFixed(0)}</div>
            </div>
            <div className="col-3">
              <div className="small text-info fw-bold">1 Week</div>
              <div className="fw-bold">${liquidity.oneWeekAccess.toFixed(0)}</div>
            </div>
            <div className="col-3">
              <div className="small text-warning fw-bold">30 Days</div>
              <div className="fw-bold">${liquidity.thirtyDayAccess.toFixed(0)}</div>
            </div>
            <div className="col-3">
              <div className="small text-danger fw-bold">Long Term</div>
              <div className="fw-bold">${liquidity.longTerm.toFixed(0)}</div>
            </div>
          </div>
        </div>

        {/* Emergency Fund Coverage */}
        <div className="mt-4">
          <h5>
            <ShieldAlert size={18} className="me-2" />
            Emergency Fund Coverage
          </h5>
          <div className="d-flex justify-content-between mb-2">
            <span>Coverage for 6 months expenses</span>
            <span className="fw-bold">{liquidity.emergencyFundCoverage.toFixed(0)}%</span>
          </div>
          <ProgressBar 
            now={Math.min(liquidity.emergencyFundCoverage, 100)} 
            variant={liquidity.emergencyFundCoverage >= 100 ? 'success' : liquidity.emergencyFundCoverage >= 50 ? 'warning' : 'danger'}
          />
          <p className="text-muted mt-2 small">
            Estimated monthly expenses: ${liquidity.monthlyExpensesEstimate.toFixed(0)} • 
            Required emergency fund: ${(liquidity.monthlyExpensesEstimate * 6).toFixed(0)}
          </p>
        </div>

      </Card.Body>
    </Card>
  );
};

export default LiquidityScore;