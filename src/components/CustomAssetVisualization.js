import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CustomAssetVisualization = ({ assetItems, assetFields, assetName, currency }) => {
  const [timeRange, setTimeRange] = useState('all'); // Future enhancement: add time range filter

  // Find the date and cost fields from the asset configuration
  const dateField = assetFields.find(field => field.type === 'date')?.name;
  const costField = assetFields.find(field => field.type === 'cost')?.name;

  // Process data for visualization
  const processedData = assetItems
    .filter(item => item[dateField] && item[costField]) // Ensure required fields exist
    .map(item => ({
      date: item[dateField],
      value: parseFloat(item[costField]) || 0,
      // Add additional fields for tooltip
      ...assetFields.reduce((acc, field) => {
        if (field.name !== dateField && field.name !== costField) {
          acc[field.name] = item[field.name];
        }
        return acc;
      }, {})
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate trend line data
  const calculateTrendLine = () => {
    if (processedData.length < 2) return processedData;
    
    const xValues = processedData.map((_, i) => i);
    const yValues = processedData.map(d => d.value);
    
    // Calculate linear regression
    const n = processedData.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return processedData.map((point, i) => ({
      ...point,
      trend: slope * i + intercept
    }));
  };

  const chartData = calculateTrendLine();

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate basic statistics
  const stats = {
    totalValue: processedData.reduce((sum, item) => sum + item.value, 0),
    averageValue: processedData.reduce((sum, item) => sum + item.value, 0) / processedData.length,
    minValue: Math.min(...processedData.map(item => item.value)),
    maxValue: Math.max(...processedData.map(item => item.value)),
    totalItems: processedData.length
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">{assetName} Value Analysis</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <strong>Analysis Summary:</strong>
          <ul>
            <li>Total Portfolio Value: {formatCurrency(stats.totalValue)}</li>
            <li>Average Item Value: {formatCurrency(stats.averageValue)}</li>
            <li>Value Range: {formatCurrency(stats.minValue)} - {formatCurrency(stats.maxValue)}</li>
            <li>Total Items: {stats.totalItems}</li>
          </ul>
        </div>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Value' || name === 'Trend') {
                    return [formatCurrency(value), name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                name="Value"
                strokeWidth={2}
              />
              {chartData.length > 1 && (
                <Line 
                  type="monotone" 
                  dataKey="trend" 
                  stroke="#82ca9d" 
                  name="Trend"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CustomAssetVisualization;