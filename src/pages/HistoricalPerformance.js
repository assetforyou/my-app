// HistoricalPerformance.js
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../style/Analytics.css';

const HistoricalPerformance = ({ cashList, stockList, metalList, propertyList }) => {
  const [timeRange, setTimeRange] = useState('1Y');

  const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isValidDate(date)) {
        return date.toISOString().split('T')[0];
      }
      return null;
    } catch (error) {
      console.error('Date parsing error:', error);
      return null;
    }
  };

  const preparePerformanceData = () => {
    const allDates = new Set();
    const assetData = {};
    
    const processItem = (item, key, dateKey) => {
      const dateStr = formatDate(item[dateKey]);
      if (dateStr) {
        allDates.add(dateStr);
        if (!assetData[dateStr]) {
          assetData[dateStr] = {
            cash: 0,
            stocks: 0,
            metals: 0,
            property: 0
          };
        }
        const value = parseFloat(item.amount || item.total || item.price || 0);
        if (!isNaN(value)) {
          assetData[dateStr][key] += value;
        }
      }
    };

    // Process each list separately
    cashList?.forEach(item => processItem(item, 'cash', 'transactionDate'));
    stockList?.forEach(item => processItem(item, 'stocks', 'purchaseDate'));
    metalList?.forEach(item => processItem(item, 'metals', 'purchaseDate'));
    propertyList?.forEach(item => processItem(item, 'property', 'purchaseDate'));

    // Convert to array and sort by date
    const sortedDates = Array.from(allDates).sort();
    return sortedDates.map(date => ({
      date,
      ...assetData[date]
    }));
  };

  const performanceData = preparePerformanceData();

  // Filter data based on time range
  const filterDataByTimeRange = (data) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.date) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(performanceData);

  return (
    <div className="analytics-card">
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">Historical Performance</h3>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="1Y">1 Year</option>
            <option value="ALL">All Time</option>
          </select>
        </div>
        <div className="chart-container">
          {filteredData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    return new Date(date).toLocaleDateString();
                  }}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line type="monotone" dataKey="cash" stroke="#8884d8" name="Cash" />
                <Line type="monotone" dataKey="stocks" stroke="#82ca9d" name="Stocks" />
                <Line type="monotone" dataKey="metals" stroke="#ffc658" name="Metals" />
                <Line type="monotone" dataKey="property" stroke="#ff7300" name="Property" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">No data available for the selected time range</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricalPerformance;