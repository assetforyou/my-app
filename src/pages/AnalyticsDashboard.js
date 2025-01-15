import React from 'react';
import GeographicDistribution from './GeographicDistribution';
import GoalTracker from './GoalTracker';
import HistoricalPerformance from './HistoricalPerformance';
import CashFlow from './CashFlow';
import AlternativeInvestments from './AlternativeInvestments';
import CustomAssetPerformance from './CustomAssetPerformance';
import RiskAssessment from './RiskAssessment';
import TaxImpactAnalysis from './TaxImpactAnalysis';

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
  cashTotal,
  stockTotal,
  metalTotal,
  propertyTotalPrice,
  customAssets,
  userEmail,
  loanList = []
}) => {
  return (
    <div className="analytics-container">
      <ScrollableChart title="Geographic Distribution">
        <GeographicDistribution propertyList={propertyList} stockList={stockList} />
      </ScrollableChart>
      
      <ScrollableChart title="Goal Tracker">
        <GoalTracker 
          cashTotal={cashTotal}
          stockTotal={stockTotal}
          metalTotal={metalTotal}
          propertyTotal={propertyTotalPrice}
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
        <AlternativeInvestments userEmail={userEmail} />
      </ScrollableChart>
      
      <ScrollableChart title="Historical Performance">
        <HistoricalPerformance 
          cashList={cashList}
          stockList={stockList}
          metalList={metalList}
          propertyList={propertyList}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Custom Asset Performance">
        <CustomAssetPerformance 
          customAssets={customAssets}
          propertyList={propertyList}
          stockList={stockList}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Risk Assessment">
        <RiskAssessment 
          cashList={cashList}
          stockList={stockList}
          metalList={metalList}
          propertyList={propertyList}
        />
      </ScrollableChart>
      
      <ScrollableChart title="Tax Impact Analysis">
        <TaxImpactAnalysis 
          cashList={cashList}
          stockList={stockList}
          metalList={metalList}
          propertyList={propertyList}
        />
      </ScrollableChart>
    </div>
  );
};

export default AnalyticsDashboard;