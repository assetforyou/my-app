import React from 'react';
import GeographicDistribution from './GeographicDistribution';
import GoalTracker from './GoalTracker';
import HistoricalPerformance from './HistoricalPerformance';
import CashFlow from './CashFlow';
import '../style/Analytics.css';

const AnalyticsDashboard = ({ 
  cashList, 
  stockList, 
  metalList, 
  propertyList,
  cashTotal,
  stockTotal,
  metalTotal,
  propertyTotalPrice,
  loanList = [] // Add default empty array for loanList
}) => {
  return (
    <div className="analytics-dashboard">
      <div className="analytics-grid">
        <GeographicDistribution propertyList={propertyList} stockList={stockList} />
        <GoalTracker 
          cashTotal={cashTotal}
          stockTotal={stockTotal}
          metalTotal={metalTotal}
          propertyTotal={propertyTotalPrice}
        />
        <CashFlow 
          propertyList={propertyList} 
          loanList={loanList} 
          cashList={cashList}
        />
        <div className="full-width">
          <HistoricalPerformance 
            cashList={cashList}
            stockList={stockList}
            metalList={metalList}
            propertyList={propertyList}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;