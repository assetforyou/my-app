import React from 'react';
import { Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CashFlowAnalysis = ({ propertyList, loanList, cashList }) => {
  const calculateMonthlyIncome = () => {
    // Calculate rental income
    const rentalIncome = propertyList.reduce((total, property) => 
      total + parseFloat(property.rentalIncome || 0), 0);
    
    // Calculate other regular income from cash entries
    const otherIncome = cashList
      .filter(cash => cash.category === 'income')
      .reduce((total, cash) => total + parseFloat(cash.amount || 0), 0) / 12;

    return rentalIncome + otherIncome;
  };

  const calculateMonthlyExpenses = () => {
    // Calculate property expenses
    const propertyExpenses = propertyList.reduce((total, property) => 
      total + parseFloat(property.totalMonthlyCost || 0), 0);
    
    // Calculate loan payments
    const loanPayments = loanList.reduce((total, loan) => 
      total + parseFloat(loan.monthlyPayment || 0), 0);
    
    // Calculate other regular expenses
    const otherExpenses = cashList
      .filter(cash => cash.category === 'expense')
      .reduce((total, cash) => total + parseFloat(cash.amount || 0), 0) / 12;

    return propertyExpenses + loanPayments + otherExpenses;
  };

  const monthlyIncome = calculateMonthlyIncome();
  const monthlyExpenses = calculateMonthlyExpenses();
  const netCashFlow = monthlyIncome - monthlyExpenses;

  const cashFlowData = [
    { name: 'Income', amount: monthlyIncome },
    { name: 'Expenses', amount: monthlyExpenses },
    { name: 'Net Flow', amount: netCashFlow }
  ];

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Monthly Cash Flow Analysis</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <div className="row text-center">
            <div className="col">
              <h6>Monthly Income</h6>
              <p className="text-success">${monthlyIncome.toLocaleString()}</p>
            </div>
            <div className="col">
              <h6>Monthly Expenses</h6>
              <p className="text-danger">${monthlyExpenses.toLocaleString()}</p>
            </div>
            <div className="col">
              <h6>Net Cash Flow</h6>
              <p className={netCashFlow >= 0 ? 'text-success' : 'text-danger'}>
                ${netCashFlow.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

export default CashFlowAnalysis;