import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import '../style/Analytics.css';

const GeographicDistribution = ({ propertyList, stockList }) => {
  const [view, setView] = useState('property');
  
  const calculateDistribution = (list, locationKey, valueKey) => {
    const distribution = list.reduce((acc, item) => {
      const location = item[locationKey] || 'Unknown';
      acc[location] = (acc[location] || 0) + parseFloat(item[valueKey] || 0);
      return acc;
    }, {});

    return Object.entries(distribution).map(([location, value]) => ({
      name: location,
      value
    }));
  };

  const data = view === 'property' 
    ? calculateDistribution(propertyList, 'location', 'price')
    : calculateDistribution(stockList, 'region', 'total');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="analytics-card">
      <div className="card-content">
        <h3 className="card-title">Geographic Distribution</h3>
        <div className="button-group">
          <button 
            className={`analytics-button ${view === 'property' ? 'active' : ''}`}
            onClick={() => setView('property')}
          >
            Properties
          </button>
          <button 
            className={`analytics-button ${view === 'stock' ? 'active' : ''}`}
            onClick={() => setView('stock')}
          >
            Stocks
          </button>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GeographicDistribution;