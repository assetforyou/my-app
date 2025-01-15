import React from 'react';
import Layout from '../components/AdLayout';
import { Card } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CashFlow = ({ propertyList = [], loanList = [], cashList = [] }) => {
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
    <Layout>
      <div className="container-fluid px-4">
        <div className="row">
          <div className="col-12">
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Monthly Cash Flow Analysis</h5>
              </Card.Header>
              <Card.Body>
                <div className="row mb-4">
                  <div className="col-md-4">
                    <Card className="text-center h-100">
                      <Card.Body>
                        <h6>Monthly Income</h6>
                        <p className="text-success h4">
                          ${monthlyIncome.toLocaleString()}
                        </p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-4">
                    <Card className="text-center h-100">
                      <Card.Body>
                        <h6>Monthly Expenses</h6>
                        <p className="text-danger h4">
                          ${monthlyExpenses.toLocaleString()}
                        </p>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-4">
                    <Card className="text-center h-100">
                      <Card.Body>
                        <h6>Net Cash Flow</h6>
                        <p className={`h4 ${netCashFlow >= 0 ? 'text-success' : 'text-danger'}`}>
                          ${netCashFlow.toLocaleString()}
                        </p>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer>
                    <LineChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CashFlow;