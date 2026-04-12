import React from 'react';
import GeographicDistribution from './GeographicDistribution';
import GoalTracker from './GoalTracker';
import HistoricalPerformance from './HistoricalPerformance';
import CashFlow from './CashFlow';
import AlternativeInvestments from './AlternativeInvestments';
import CustomAssetPerformance from './CustomAssetPerformance';
import RiskAssessment from './RiskAssessment';
import TaxImpactAnalysis from './TaxImpactAnalysis';
import CryptoProjection from '../components/CryptoProjection';
import DividendIncome from '../components/DividendIncome';
import LiquidityScore from '../components/LiquidityScore';
import DiversificationScore from '../components/DiversificationScore';
import InflationImpactAnalysis from '../components/InflationImpactAnalysis';

const ScrollableChart = ({ children, title }) => (
  <div className="analytics-card">
    <div className="card-content">
      <h2 className="card-title">{title}</h2>
      <div className="chart-scroll-container">
        <div className="chart-container">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsDashboard = ({ 
  cashList, 
  stockList, 
  metalList, 
  propertyList,
  cryptoList,
  cashTotal,
  stockTotal,
  metalTotal,
  propertyTotalPrice,
  cryptoTotal,
  customAssets,
  userEmail,
  loanList = []
}) => {
  return (
    <div className="analytics-container">
      <ScrollableChart title="Diversification Score">
        <DiversificationScore 
          assets={{
            cash: cashList,
            stocks: stockList,
            metals: metalList,
            properties: propertyList,
            crypto: cryptoList,
            bonds: customAssets.filter(a => a.type === 'bond'),
            retirement: customAssets.filter(a => a.type === 'retirement'),
            savings: customAssets.filter(a => a.type === 'savings'),
            cars: [],
            loans: [],
            customAssets
          }}
        />
      </ScrollableChart>

      <ScrollableChart title="Inflation Impact Analysis">
        <InflationImpactAnalysis 
          assets={{
            cash: cashList,
            stocks: stockList,
            metals: metalList,
            properties: propertyList,
            crypto: cryptoList,
            bonds: customAssets.filter(a => a.type === 'bond'),
            retirement: customAssets.filter(a => a.type === 'retirement'),
            savings: customAssets.filter(a => a.type === 'savings'),
            cars: [],
            customAssets
          }}
        />
      </ScrollableChart>

      <ScrollableChart title="Dividend & Passive Income">
        <DividendIncome 
          stockList={stockList || []}
          etfList={[]}
          bondList={customAssets.filter(a => a.type === 'bond') || []}
        />
      </ScrollableChart>

      <ScrollableChart title="Portfolio Liquidity Score">
        <LiquidityScore 
          assets={{
            cash: cashList,
            stocks: stockList,
            crypto: cryptoList,
            metals: metalList,
            properties: propertyList,
            cars: [],
            loans: [],
            bonds: customAssets.filter(a => a.type === 'bond'),
            etfs: [],
            customAssets
          }}
        />
      </ScrollableChart>

      <ScrollableChart title="Cryptocurrency Projections">
        <CryptoProjection 
          cryptoList={cryptoList || []}
          selectedCryptoIds={[]}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Geographic Distribution">
        <GeographicDistribution propertyList={propertyList} stockList={stockList} />
      </ScrollableChart>
      
      <ScrollableChart title="Goal Tracker">
        <GoalTracker 
          cashTotal={cashTotal}
          stockTotal={stockTotal}
          metalTotal={metalTotal}
          propertyTotal={propertyTotalPrice}
          cryptoTotal={cryptoTotal}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Cash Flow">
        <CashFlow 
          propertyList={propertyList} 
          loanList={loanList} 
          cashList={cashList}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Alternative Investments">
        <AlternativeInvestments 
          cryptoList={cryptoList}
          nftList={[]}
          privateEquityList={[]}
          ventureCapitalList={[]}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Historical Performance">
        <HistoricalPerformance 
          cashList={cashList}
          stockList={stockList}
          metalList={metalList}
          propertyList={propertyList}
          cryptoList={cryptoList}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Custom Asset Performance">
        <CustomAssetPerformance 
          customAssets={customAssets}
          propertyList={propertyList}
          stockList={stockList}
          cryptoList={cryptoList}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Risk Assessment">
        <RiskAssessment 
          cashList={cashList}
          stockList={stockList}
          metalList={metalList}
          propertyList={propertyList}
          cryptoList={cryptoList}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Tax Impact Analysis">
        <TaxImpactAnalysis 
          cashList={cashList}
          stockList={stockList}
          metalList={metalList}
          propertyList={propertyList}
          cryptoList={cryptoList}
        />
      </ScrollableChart>
    </div>
  );
};

export default AnalyticsDashboard;