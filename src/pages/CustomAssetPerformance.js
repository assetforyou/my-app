import React from 'react';
import { Card } from 'react-bootstrap';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomAssetPerformance = ({ customAssets, propertyList, stockList }) => {
  const calculatePerformanceMetrics = () => {
    // Generate performance data for the last 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const adjustedIndex = (currentMonth + index) % 12;
      const monthName = months[adjustedIndex];
      
      return {
        month: monthName,
        customAssetValue: customAssets.reduce((total, asset) => {
          const baseValue = parseFloat(asset.totalValue || 0);
          // Simulate some variation in performance
          return total + baseValue * (1 + (Math.sin(index) * 0.1));
        }, 0),
        traditionalAssetValue: (
          propertyList.reduce((total, property) => total + parseFloat(property.price || 0), 0) +
          stockList.reduce((total, stock) => total + parseFloat(stock.total || 0), 0)
        ) * (1 + (Math.cos(index) * 0.05))
      };
    });
  };

  const calculateMaintenanceCosts = () => {
    return customAssets.map(asset => ({
      name: asset.name,
      maintenanceCost: parseFloat(asset.maintenanceCost || 0),
      appreciationRate: parseFloat(asset.appreciationRate || 0),
      totalValue: parseFloat(asset.totalValue || 0)
    }));
  };

  const performanceData = calculatePerformanceMetrics();
  const maintenanceData = calculateMaintenanceCosts();

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Custom Asset Performance Analysis</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <h6>Performance Comparison</h6>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="customAssetValue" name="Custom Assets" stroke="#8884d8" />
              <Line type="monotone" dataKey="traditionalAssetValue" name="Traditional Assets" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <h6>Maintenance Cost Analysis</h6>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="maintenanceCost" name="Maintenance Cost" fill="#8884d8" />
              <Area type="monotone" dataKey="appreciationRate" name="Appreciation Rate %" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CustomAssetPerformance;