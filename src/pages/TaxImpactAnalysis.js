import React from 'react';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TaxImpactAnalysis = ({ cashList, stockList, metalList, propertyList }) => {
  const calculateTaxImplications = () => {
    // Calculate estimated tax implications for different asset types
    const taxData = [
      {
        category: 'Cash Accounts',
        taxableInterest: cashList.reduce((total, cash) => 
          cash.category === 'interest' ? total + (parseFloat(cash.amount) * 0.25) : total, 0),
        taxAdvantaged: cashList.reduce((total, cash) => 
          cash.category === 'tax-free' ? total + parseFloat(cash.amount) : 0, 0)
      },
      {
        category: 'Stocks',
        capitalGains: stockList.reduce((total, stock) => 
          parseFloat(stock.total) - parseFloat(stock.costBasis || 0), 0),
        dividends: stockList.reduce((total, stock) => 
          parseFloat(stock.dividends || 0), 0)
      },
      {
        category: 'Properties',
        rentalIncome: propertyList.reduce((total, property) => 
          total + parseFloat(property.rentalIncome || 0), 0),
        depreciation: propertyList.reduce((total, property) => 
          total + (parseFloat(property.price || 0) * 0.036), 0) // Simplified 27.5 year depreciation
      }
    ];

    return taxData;
  };

  const taxData = calculateTaxImplications();

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Tax Impact Analysis</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taxData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="taxableInterest" fill="#8884d8" name="Taxable Interest" />
              <Bar dataKey="taxAdvantaged" fill="#82ca9d" name="Tax Advantaged" />
              <Bar dataKey="capitalGains" fill="#ffc658" name="Capital Gains" />
              <Bar dataKey="dividends" fill="#ff8042" name="Dividends" />
              <Bar dataKey="rentalIncome" fill="#a4de6c" name="Rental Income" />
              <Bar dataKey="depreciation" fill="#d88484" name="Depreciation" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="tax-summary mt-4">
          <h6>Tax Considerations:</h6>
          <ul className="list-unstyled">
            <li>✓ Tax-advantaged accounts: ${taxData[0].taxAdvantaged.toLocaleString()}</li>
            <li>✓ Estimated capital gains exposure: ${taxData[1].capitalGains.toLocaleString()}</li>
            <li>✓ Property depreciation benefits: ${taxData[2].depreciation.toLocaleString()}</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TaxImpactAnalysis;