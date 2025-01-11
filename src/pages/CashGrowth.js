import React, { useEffect, useRef } from 'react';
import { Card, Tabs, Tab } from 'react-bootstrap';
import Chart from 'chart.js/auto';

const LongTermGrowthChart = ({ cashList }) => {
  const chartRefs = useRef({});
  const chartInstances = useRef({});
  const GROWTH_RATE = 0.20; // 20% annual growth
  const YEARS = 30;

  // Group cash by account type
  const groupedCash = cashList.reduce((acc, cash) => {
    const accountType = cash.accountType || 'Uncategorized';
    if (!acc[accountType]) {
      acc[accountType] = [];
    }
    acc[accountType].push(cash);
    return acc;
  }, {});

  const generateProjectionData = (initialValue) => {
    return Array.from({ length: YEARS + 1 }, (_, year) => {
      const projectedValue = initialValue * Math.pow(1 + GROWTH_RATE, year);
      return {
        year,
        value: projectedValue,
        humanReadableValue: projectedValue.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        })
      };
    });
  };

  const createChart = (ctx, projectionData, accountType) => {
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: projectionData.map(d => `Year ${d.year}`),
        datasets: [{
          label: 'Projected Value',
          data: projectionData.map(d => d.value),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `30-Year Growth Projection for ${accountType} (20% Annual Return)`,
            font: {
              size: 16
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return `Projected Value: ${value.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time Period'
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Value ($)'
            },
            ticks: {
              callback: (value) => {
                if (value >= 1e9) {
                  return `$${(value / 1e9).toFixed(1)}B`;
                }
                if (value >= 1e6) {
                  return `$${(value / 1e6).toFixed(1)}M`;
                }
                if (value >= 1e3) {
                  return `$${(value / 1e3).toFixed(1)}K`;
                }
                return `$${value}`;
              }
            }
          }
        }
      }
    });
  };

  useEffect(() => {
    // Cleanup previous charts
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });
    chartInstances.current = {};

    // Create new charts for each account type
    Object.entries(groupedCash).forEach(([accountType, transactions]) => {
      const initialValue = transactions.reduce((sum, cash) => 
        sum + parseFloat(cash.amount || 0), 0);
      
      const projectionData = generateProjectionData(initialValue);
      
      if (chartRefs.current[accountType]) {
        const ctx = chartRefs.current[accountType].getContext('2d');
        chartInstances.current[accountType] = createChart(ctx, projectionData, accountType);
      }
    });

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) {
          chart.destroy();
        }
      });
    };
  }, [cashList]);

  return (
    <div>
      <div className="mb-3">
        <strong>Investment Growth Details:</strong>
        <ul>
          <li>Annual Growth Rate: 20%</li>
          <li>Time Period: 30 years</li>
          <li>Initial Investment: Starting total from each account type</li>
        </ul>
      </div>
      <Tabs className="mb-3">
        {Object.entries(groupedCash).map(([accountType, transactions]) => {
          const initialValue = transactions.reduce((sum, cash) => 
            sum + parseFloat(cash.amount || 0), 0);
          
          return (
            <Tab 
              key={accountType} 
              eventKey={accountType} 
              title={`${accountType} ($${initialValue.toLocaleString()})`}
            >
              <div className="mb-3">
                <strong>Initial Value:</strong> ${initialValue.toLocaleString()}
                <br />
                <strong>Projected Value after 30 years:</strong> $
                {(initialValue * Math.pow(1 + GROWTH_RATE, YEARS)).toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </div>
              <div style={{ height: '400px' }}>
                <canvas 
                  ref={el => chartRefs.current[accountType] = el}
                />
              </div>
            </Tab>
          );
        })}
      </Tabs>
    </div>
  );
};

export default LongTermGrowthChart;