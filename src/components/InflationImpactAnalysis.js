import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { TrendingDown, ShieldAlert, DollarSign, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InflationImpactAnalysis = ({ assets }) => {
  
  const INFLATION_RATE = 3.5; // Average annual inflation
  const TARGET_INFLATION = 2.0; // Fed target

  const calculateInflationImpact = () => {
    // Calculate total portfolio value
    const totalValue = Object.entries(assets).reduce((total, [type, assetList]) => {
      return total + assetList.reduce((sum, asset) => {
        let value = 0;
        switch(type) {
          case 'cash': case 'savings': value = parseFloat(asset.amount || asset.currentBalance || 0); break;
          case 'stocks': case 'crypto': case 'metals': value = parseFloat(asset.total || 0); break;
          case 'properties': case 'cars': value = parseFloat(asset.price || asset.value || 0); break;
          case 'bonds': value = parseFloat(asset.currentValue || 0); break;
          case 'retirement': value = parseFloat(asset.currentBalance || 0); break;
          case 'customAssets': value = parseFloat(asset.totalValue || 0); break;
          default: value = 0;
        }
        return sum + value;
      }, 0);
    }, 0);

    // Calculate inflation sensitivity per asset class
    const assetSensitivity = {
      cash: 1.0,      // 100% exposed to inflation
      savings: 0.8,   // 80% exposed
      bonds: 0.7,     // 70% exposed
      stocks: 0.3,    // 30% exposed
      metals: 0.1,    // 10% exposed (inflation hedge)
      crypto: 0.2,    // 20% exposed
      properties: 0.2,// 20% exposed (real asset)
      autos: 0.9,     // 90% exposed
      retirement: 0.5,// 50% exposed
      customAssets: 0.6
    };

    // Calculate weighted inflation exposure
    let weightedExposure = 0;
    Object.entries(assets).forEach(([type, assetList]) => {
      const typeValue = assetList.reduce((sum, asset) => {
        let value = 0;
        switch(type) {
          case 'cash': case 'savings': value = parseFloat(asset.amount || asset.currentBalance || 0); break;
          case 'stocks': case 'crypto': case 'metals': value = parseFloat(asset.total || 0); break;
          case 'properties': case 'cars': value = parseFloat(asset.price || asset.value || 0); break;
          case 'bonds': value = parseFloat(asset.currentValue || 0); break;
          case 'retirement': value = parseFloat(asset.currentBalance || 0); break;
          case 'customAssets': value = parseFloat(asset.totalValue || 0); break;
          default: value = 0;
        }
        return sum + value;
      }, 0);
      
      const sensitivity = assetSensitivity[type] || 0.5;
      weightedExposure += typeValue * sensitivity;
    });

    const inflationScore = totalValue > 0 ? 100 - ((weightedExposure / totalValue) * 100) : 50;

    // Generate 30 year projection
    const projectionData = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i <= 30; i += 5) {
      const nominalValue = totalValue * Math.pow(1.04, i); // 4% nominal return
      const realValue = totalValue * Math.pow(1.04 - (INFLATION_RATE / 100), i);
      const lossToInflation = nominalValue - realValue;
      
      projectionData.push({
        year: currentYear + i,
        nominal: Math.round(nominalValue),
        real: Math.round(realValue),
        loss: Math.round(lossToInflation)
      });
    }

    // Calculate purchasing power erosion
    const purchasingPower5yr = Math.pow(1 - (INFLATION_RATE / 100), 5);
    const purchasingPower10yr = Math.pow(1 - (INFLATION_RATE / 100), 10);
    const purchasingPower20yr = Math.pow(1 - (INFLATION_RATE / 100), 20);

    return {
      totalValue,
      inflationScore,
      weightedExposure,
      projectionData,
      purchasingPower5yr,
      purchasingPower10yr,
      purchasingPower20yr,
      inflationRate: INFLATION_RATE
    };
  };

  const inflation = calculateInflationImpact();

  const getScoreStatus = (score) => {
    if (score >= 70) return { color: 'success', text: 'Good Inflation Hedge', description: 'Your portfolio is well protected against inflation' };
    if (score >= 50) return { color: 'primary', text: 'Moderate Inflation Exposure', description: 'Consider adding more inflation resistant assets' };
    return { color: 'info', text: 'Building Inflation Protection', description: 'Add inflation hedges like metals or real estate' };
  };

  const status = getScoreStatus(inflation.inflationScore);

  return (
    <Card className="inflation-impact-card">
      <Card.Body>
        <h3 className="mb-4">
          <TrendingDown size={24} className="me-2 text-primary" />
          Inflation Impact Analysis
        </h3>

        <div className="text-center mb-4">
          <div className={`inflation-score-circle text-${status.color}`}>
            <ShieldAlert size={48} className="mb-2" />
            <div className="score-value">{inflation.inflationScore.toFixed(0)}</div>
            <div className="score-label">/ 100</div>
          </div>
          <h4 className={`mt-3 text-${status.color}`}>{status.text}</h4>
          <p className="text-muted mt-2">{status.description}</p>
        </div>

        <div className="mb-4">
          <h5>Purchasing Power Erosion</h5>
          <p className="text-muted small mb-3">
            At {inflation.inflationRate}% annual inflation, $1 today will be worth:
          </p>
          <div className="row text-center g-2">
            <div className="col-4">
              <div className="purchasing-power-box">
                <Clock size={16} className="text-muted mb-1" />
                <div className="small text-muted">5 Years</div>
                <div className="fw-bold">{(inflation.purchasingPower5yr * 100).toFixed(0)}¢</div>
              </div>
            </div>
            <div className="col-4">
              <div className="purchasing-power-box">
                <Clock size={16} className="text-muted mb-1" />
                <div className="small text-muted">10 Years</div>
                <div className="fw-bold">{(inflation.purchasingPower10yr * 100).toFixed(0)}¢</div>
              </div>
            </div>
            <div className="col-4">
              <div className="purchasing-power-box">
                <Clock size={16} className="text-muted mb-1" />
                <div className="small text-muted">20 Years</div>
                <div className="fw-bold">{(inflation.purchasingPower20yr * 100).toFixed(0)}¢</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h5>Nominal vs Real Value Projection</h5>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inflation.projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => `$${parseFloat(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="nominal" stroke="#3B82F6" strokeWidth={2} name="Nominal Value" dot={false} />
                <Line type="monotone" dataKey="real" stroke="#10B981" strokeWidth={2} name="Real Value (inflation adjusted)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4">
          <h5>
            <DollarSign size={18} className="me-2" />
            Total Loss to Inflation Over 30 Years
          </h5>
          <div className="text-center p-3 bg-light rounded">
            <div className="h3 text-primary mb-0">
              ${inflation.projectionData[inflation.projectionData.length-1]?.loss?.toLocaleString() || 0}
            </div>
            <p className="text-muted small mb-0">Estimated total value lost to inflation at current rates</p>
          </div>
        </div>

      </Card.Body>
    </Card>
  );
};

export default InflationImpactAnalysis;