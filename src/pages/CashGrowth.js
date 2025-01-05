import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Form } from 'react-bootstrap';

function CashGrowth({ cashList }) {
  const [interestRate, setInterestRate] = useState(5);

  const calculateGrowth = () => {
    const totalInitialValue = cashList.reduce((acc, cash) => acc + parseFloat(cash.amount || 0), 0);
    const data = [];
    
    for (let year = 0; year <= 5; year++) {
      const value = totalInitialValue * Math.pow(1 + (interestRate / 100), year);
      data.push({
        year: `Year ${year}`,
        value: parseFloat(value.toFixed(2))
      });
    }
    return data;
  };

  return (
    <Card.Body>
      <div className="mb-3">
        <Form.Label>Interest Rate: {interestRate}%</Form.Label>
        <Form.Range 
          min={0}
          max={30}
          step={0.5}
          value={interestRate}
          onChange={(e) => setInterestRate(parseFloat(e.target.value))}
        />
      </div>
      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={calculateGrowth()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Projected Value']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#82ca9d" 
              name="Projected Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card.Body>
  );
}

export default CashGrowth;