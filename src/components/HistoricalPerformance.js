import React, { useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const HistoricalPerformance = ({ cashList, stockList, metalList, propertyList }) => {
  const [timeRange, setTimeRange] = useState('1Y');

  const preparePerformanceData = () => {
    // Group transactions by date for each asset type
    const allDates = new Set();
    const assetData = {};
    
    // Process each asset type and collect dates
    [
      { list: cashList, key: 'cash', dateKey: 'transactionDate' },
      { list: stockList, key: 'stocks', dateKey: 'purchaseDate' },
      { list: metalList, key: 'metals', dateKey: 'purchaseDate' },
      { list: propertyList, key: 'property', dateKey: 'purchaseDate' }
    ].forEach(({ list, key, dateKey }) => {
      list.forEach(item => {
        const date = new Date(item[dateKey]);
        const dateStr = date.toISOString().split('T')[0];
        allDates.add(dateStr);
        
        if (!assetData[dateStr]) {
          assetData[dateStr] = {};
        }
        assetData[dateStr][key] = (assetData[dateStr][key] || 0) + parseFloat(item.amount || item.total || item.price || 0);
      });
    });

    // Convert to array and sort by date
    return Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        cash: assetData[date].cash || 0,
        stocks: assetData[date].stocks || 0,
        metals: assetData[date].metals || 0,
        property: assetData[date].property || 0
      }));
  };

  const performanceData = preparePerformanceData();

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Historical Performance</h5>
        <Form.Select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="1M">1 Month</option>
          <option value="3M">3 Months</option>
          <option value="1Y">1 Year</option>
          <option value="ALL">All Time</option>
        </Form.Select>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cash" stroke="#8884d8" />
            <Line type="monotone" dataKey="stocks" stroke="#82ca9d" />
            <Line type="monotone" dataKey="metals" stroke="#ffc658" />
            <Line type="monotone" dataKey="property" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default HistoricalPerformance;