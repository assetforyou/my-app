import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const GeographicDistribution = ({ propertyList, stockList }) => {
  const [view, setView] = useState('property');

  const calculatePropertyDistribution = () => {
    const distribution = propertyList.reduce((acc, property) => {
      const location = property.location || 'Unknown';
      acc[location] = (acc[location] || 0) + parseFloat(property.price || 0);
      return acc;
    }, {});

    return Object.entries(distribution).map(([location, value]) => ({
      name: location,
      value
    }));
  };

  const calculateStockDistribution = () => {
    const distribution = stockList.reduce((acc, stock) => {
      const region = stock.region || 'Unknown';
      acc[region] = (acc[region] || 0) + parseFloat(stock.total || 0);
      return acc;
    }, {});

    return Object.entries(distribution).map(([region, value]) => ({
      name: region,
      value
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Geographic Distribution</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-center mb-3">
          <button 
            className={`btn ${view === 'property' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
            onClick={() => setView('property')}
          >
            Properties
          </button>
          <button 
            className={`btn ${view === 'stock' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setView('stock')}
          >
            Stocks
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={view === 'property' ? calculatePropertyDistribution() : calculateStockDistribution()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {calculatePropertyDistribution().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default GeographicDistribution;