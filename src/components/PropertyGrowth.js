import React, { useEffect, useRef } from 'react';
import { Card, Tabs, Tab } from 'react-bootstrap';
import Chart from 'chart.js/auto';

const PropertyGrowthChart = ({ propertyList }) => {
  const chartRefs = useRef({});
  const chartInstances = useRef({});
  const YEARS = 30;
  const APPRECIATION_RATE = 0.0386; // 3.86% historical average
  const RENTAL_GROWTH_RATE = 0.0315; // 3.15% historical average

  const generateProjectionData = (property) => {
    const initialValue = parseFloat(property.price);
    const monthlyIncome = 
      parseFloat(property.mortgagePayment || 0) +
      parseFloat(property.utilities || 0) +
      parseFloat(property.otherExpenses || 0);
    const annualIncome = monthlyIncome * 12;

    return Array.from({ length: YEARS + 1 }, (_, year) => {
      const propertyValue = initialValue * Math.pow(1 + APPRECIATION_RATE, year);
      const yearlyRental = annualIncome * Math.pow(1 + RENTAL_GROWTH_RATE, year);
      const totalReturn = ((propertyValue + yearlyRental) / initialValue - 1) * 100;

      return {
        year,
        propertyValue,
        yearlyRental,
        totalReturn: totalReturn.toFixed(1),
        appreciationOnly: ((propertyValue / initialValue - 1) * 100).toFixed(1)
      };
    });
  };

  const createChart = (ctx, projectionData, propertyId) => {
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: projectionData.map(d => `Year ${d.year}`),
        datasets: [
          {
            label: 'Property Value',
            data: projectionData.map(d => d.propertyValue),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Yearly Rental Income',
            data: projectionData.map(d => d.yearlyRental),
            borderColor: 'rgb(255, 159, 64)',
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Property Value & Rental Income Projection',
            font: { size: 16 }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return `${context.dataset.label}: $${value.toLocaleString()}`;
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
              text: 'Value ($)'
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
  };

  useEffect(() => {
    // Cleanup previous charts
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    chartInstances.current = {};

    // Create new charts for each property
    propertyList.forEach((property, index) => {
      const projectionData = generateProjectionData(property);
      const propertyId = property.id || index.toString();
      
      if (chartRefs.current[propertyId]) {
        const ctx = chartRefs.current[propertyId].getContext('2d');
        chartInstances.current[propertyId] = createChart(ctx, projectionData, propertyId);
      }
    });

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [propertyList]);

  return (
    <Card>
      <Card.Header>
        <Card.Title>Property Value & Income Projection</Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <strong>Projection Details:</strong>
          <ul>
            <li>Property Appreciation: 3.86% annual average (historical)</li>
            <li>Rental Income Growth: 3.15% annual average</li>
            <li>Includes both property value appreciation and rental income</li>
            <li>Based on current monthly costs as potential rental income</li>
          </ul>
        </div>
        <Tabs className="mb-3">
          {propertyList.map((property, index) => {
            const projectionData = generateProjectionData(property);
            
            return (
              <Tab 
                key={property.id || index}
                eventKey={property.id || index.toString()}
                title={`Property ${index + 1}`}
              >
                <div className="mb-3">
                  <strong>Initial Value:</strong> ${parseFloat(property.price).toLocaleString()}
                  <br />
                  <strong>Address:</strong> {property.address}
                  <br />
                  <strong>Monthly Costs/Potential Rent:</strong> ${(
                    parseFloat(property.mortgagePayment || 0) +
                    parseFloat(property.utilities || 0) +
                    parseFloat(property.otherExpenses || 0)
                  ).toLocaleString()}
                </div>
                <div style={{ height: '400px' }}>
                  <canvas 
                    ref={el => chartRefs.current[property.id || index.toString()] = el}
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

export default PropertyGrowthChart;