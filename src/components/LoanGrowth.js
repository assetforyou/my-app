import React, { useEffect, useRef, useState } from 'react';
import { Card, Tabs, Tab } from 'react-bootstrap';
import Chart from 'chart.js/auto';

const LoanGrowthChart = ({ loanList }) => {
  const chartRefs = useRef({});
  const chartInstances = useRef({});
  const [activeKey, setActiveKey] = useState(null);
  const YEARS = 30;
  const MONTHS = YEARS * 12;

  const calculateLoanProjection = (loan) => {
    try {
      const principal = parseFloat(loan.loanValue) || 0;
      const monthlyPayment = parseFloat(loan.repaymentPerMonth) || 0;
      const annualRate = (parseFloat(loan.interestRate) || 0) / 100;
      const monthlyRate = annualRate / 12;

      if (principal <= 0 || monthlyPayment <= 0) {
        console.warn('Invalid loan values:', { principal, monthlyPayment });
        return Array.from({ length: YEARS + 1 }, (_, year) => ({
          year,
          balance: principal,
          repaid: 0,
          percentagePaid: 0
        }));
      }

      let remainingBalance = principal;
      let totalRepaid = 0;
      const projectionData = [];

      for (let month = 0; month <= MONTHS; month++) {
        const year = Math.floor(month / 12);
        if (month % 12 === 0) {
          projectionData.push({
            year,
            balance: remainingBalance,
            repaid: totalRepaid,
            percentagePaid: ((principal - remainingBalance) / principal * 100).toFixed(1)
          });
        }
        
        if (remainingBalance > 0) {
          const interest = remainingBalance * monthlyRate;
          const principalPayment = Math.min(monthlyPayment - interest, remainingBalance);
          remainingBalance = Math.max(0, remainingBalance - principalPayment);
          totalRepaid += principalPayment + interest;
        }
      }

      return projectionData;
    } catch (error) {
      console.error('Error calculating loan projection:', error);
      return [];
    }
  };

  const createChart = (ctx, projectionData, loanType, totalLoanAmount) => {
    try {
      if (!ctx) {
        console.error('Canvas context is null');
        return null;
      }

      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: projectionData.map(d => `Year ${d.year}`),
          datasets: [
            {
              label: 'Remaining Balance',
              data: projectionData.map(d => d.balance),
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Amount Repaid',
              data: projectionData.map(d => d.repaid),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            title: {
              display: true,
              text: `Loan Repayment Progress - ${loanType}`,
              font: { size: 16 }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const label = context.dataset.label;
                  return `${label}: $${value.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time Period'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Amount ($)'
              },
              ticks: {
                callback: (value) => {
                  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
                  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
                  return `$${value}`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!loanList || loanList.length === 0) {
      console.warn('No loan data provided');
      return;
    }

    if (!activeKey && loanList.length > 0) {
      setActiveKey(loanList[0].id || '0');
    }

    // Cleanup previous charts
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    chartInstances.current = {};

    // Create new charts for each loan
    loanList.forEach((loan, index) => {
      const projectionData = calculateLoanProjection(loan);
      const loanId = loan.id || index.toString();
      
      if (chartRefs.current[loanId]) {
        const ctx = chartRefs.current[loanId].getContext('2d');
        const chart = createChart(
          ctx, 
          projectionData, 
          loan.type || `Loan ${index + 1}`, 
          parseFloat(loan.loanValue)
        );
        if (chart) {
          chartInstances.current[loanId] = chart;
        }
      }
    });

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [loanList, activeKey]);

  if (!loanList || loanList.length === 0) {
    return <div>No loan data available</div>;
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Loan Repayment Progress</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <strong>Projection Details:</strong>
          <ul>
            <li>Time Period: {YEARS} years</li>
            <li>Shows both remaining balance and total amount repaid</li>
            <li>Includes principal and interest payments</li>
            <li>Based on current interest rate and monthly payments</li>
          </ul>
        </div>
        <Tabs 
          className="mb-3" 
          activeKey={activeKey || (loanList[0]?.id || '0')}
          onSelect={(k) => setActiveKey(k)}
        >
          {loanList.map((loan, index) => {
            const projectionData = calculateLoanProjection(loan);
            const payoffYear = projectionData.findIndex(d => d.balance <= 0);
            const loanId = loan.id || index.toString();
            const totalPayments = projectionData[projectionData.length - 1]?.repaid || 0;
            
            return (
              <Tab 
                key={loanId}
                eventKey={loanId}
                title={loan.type || `Loan ${index + 1}`}
              >
                <div className="mb-3">
                  <strong>Initial Amount:</strong> ${parseFloat(loan.loanValue || 0).toLocaleString()}
                  <br />
                  <strong>Monthly Payment:</strong> ${parseFloat(loan.repaymentPerMonth || 0).toLocaleString()}
                  <br />
                  <strong>Total Payments:</strong> ${totalPayments.toLocaleString(undefined, {maximumFractionDigits: 0})}
                  <br />
                  <strong>Expected Payoff:</strong> {payoffYear > 0 ? `Year ${payoffYear}` : 'Over 30 years'}
                </div>
                <div style={{ height: '400px', width: '100%' }}>
                  <canvas 
                    ref={el => chartRefs.current[loanId] = el}
                  />
                </div>
              </Tab>
            );
          })}
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default LoanGrowthChart;