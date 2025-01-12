import React, { useState, useRef } from 'react';
import { Card, Button } from 'react-bootstrap';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Sliders } from 'lucide-react';
import AdvancedVisualizationSettings, { useAdvancedSettings } from './AdvancedVisualizationSettings';

const CustomAssetVisualization = ({ assetItems, assetFields, assetName, currency }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [smoothing, setSmoothing] = useState(0);
  const [showTrendline, setShowTrendline] = useState(true);
  const { SettingsButton, showSettings, setShowSettings, settingsButtonRef } = useAdvancedSettings();

  // Settings configuration
  const settings = [
    {
      label: 'Time Range',
      value: timeRange,
      onChange: setTimeRange,
      type: 'select',
      options: [
        { value: 'all', label: 'All Time' },
        { value: 'year', label: 'Last Year' },
        { value: 'month6', label: 'Last 6 Months' },
        { value: 'month3', label: 'Last 3 Months' }
      ]
    },
    {
      label: 'Line Smoothing',
      value: smoothing,
      onChange: setSmoothing,
      type: 'range',
      min: 0,
      max: 1,
      step: 0.1,
      unit: ''
    },
    {
      label: 'Show Trendline',
      value: showTrendline,
      onChange: setShowTrendline,
      type: 'checkbox'
    }
  ];

  // Find the date and cost fields from the asset configuration
  const dateField = assetFields.find(field => field.type === 'date')?.name;
  const costField = assetFields.find(field => field.type === 'cost')?.name;

  // Filter data based on time range
  const filterDataByTimeRange = (data) => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'month6':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case 'month3':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= filterDate);
  };

  // Process data for visualization
  const processedData = filterDataByTimeRange(
    assetItems
      .filter(item => item[dateField] && item[costField])
      .map(item => ({
        date: item[dateField],
        value: parseFloat(item[costField]) || 0,
        ...assetFields.reduce((acc, field) => {
          if (field.name !== dateField && field.name !== costField) {
            acc[field.name] = item[field.name];
          }
          return acc;
        }, {})
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  );

  // Calculate trend line data
  const calculateTrendLine = () => {
    if (processedData.length < 2) return processedData;
    
    const xValues = processedData.map((_, i) => i);
    const yValues = processedData.map(d => d.value);
    
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
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{assetName} Value Analysis</h5>
          <Button
            ref={settingsButtonRef}
            variant="light"
            size="sm"
            className="p-1"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Sliders size={16} />
          </Button>
        </div>
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
                tension={smoothing}
              />
              {showTrendline && chartData.length > 1 && (
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

        <AdvancedVisualizationSettings
          title={`${assetName} Visualization Settings`}
          settings={settings}
          target={settingsButtonRef}
          show={showSettings}
          onHide={() => setShowSettings(false)}
        />
      </Card.Body>
    </Card>
  );
};

export default CustomAssetVisualization;