import React, { useEffect, useRef, useState } from 'react';
import { Card, Tabs, Tab, Button } from 'react-bootstrap';
import { Sliders } from 'lucide-react';
import Chart from 'chart.js/auto';
import AdvancedVisualizationSettings, { useAdvancedSettings } from './AdvancedVisualizationSettings';

const MetalsGrowthChart = ({ metalList }) => {
  const chartRefs = useRef({});
  const chartInstances = useRef({});
  const [timePeriod, setTimePeriod] = useState(30);
  const { SettingsButton, showSettings, setShowSettings, settingsButtonRef } = useAdvancedSettings();
  
  const HISTORICAL_GROWTH_RATES = {
    'Gold': 0.0684,    // 6.84% annual average
    'Silver': 0.0587,  // 5.87% annual average
    'Platinum': 0.0423, // 4.23% annual average
    'Palladium': 0.0891 // 8.91% annual average
  };

  const settings = [
    {
      label: 'Time Period',
      value: timePeriod,
      onChange: setTimePeriod,
      type: 'range',
      min: 5,
      max: 50,
      step: 1,
      unit: ' years'
    }
  ];

  const generateProjectionData = (metal) => {
    const initialValue = parseFloat(metal.total);
    const growthRate = HISTORICAL_GROWTH_RATES[metal.type] || 0.06;

    return Array.from({ length: timePeriod + 1 }, (_, year) => ({
      year,
      value: initialValue * Math.pow(1 + growthRate, year),
      growthPercent: ((Math.pow(1 + growthRate, year) - 1) * 100).toFixed(1)
    }));
  };

  const createChart = (ctx, projectionData, metalType) => {
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: projectionData.map(d => `Year ${d.year}`),
        datasets: [{
          label: 'Projected Value',
          data: projectionData.map(d => d.value),
          borderColor: 'rgb(255, 215, 0)',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(255, 215, 0, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${metalType} Value Projection (${(HISTORICAL_GROWTH_RATES[metalType] * 100).toFixed(2)}% Annual Return)`,
            font: { size: 16 }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                return `Projected Value: $${value.toLocaleString()}`;
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

    // Create new charts for each metal
    metalList.forEach((metal, index) => {
      const projectionData = generateProjectionData(metal);
      const metalId = metal.id || index.toString();
      
      if (chartRefs.current[metalId]) {
        const ctx = chartRefs.current[metalId].getContext('2d');
        chartInstances.current[metalId] = createChart(ctx, projectionData, metal.type);
      }
    });

    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [metalList, timePeriod]);

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <Card.Title className="mb-0">Precious Metals Value Projection</Card.Title>
          <Button
            ref={settingsButtonRef}
            variant="light"
            size="sm"
            className="p-1"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Sliders size={16} />
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <strong>Projection Details:</strong>
          <ul>
            <li>Time Period: {timePeriod} years</li>
            <li>Based on historical average returns:</li>
            <li>Gold: 6.84% annual average</li>
            <li>Silver: 5.87% annual average</li>
            <li>Platinum: 4.23% annual average</li>
            <li>Palladium: 8.91% annual average</li>
          </ul>
        </div>
        <Tabs className="mb-3">
          {metalList.map((metal, index) => {
            const projectionData = generateProjectionData(metal);
            const finalValue = projectionData[projectionData.length - 1].value;
            
            return (
              <Tab 
                key={metal.id || index}
                eventKey={metal.id || index.toString()}
                title={metal.type || `Metal ${index + 1}`}
              >
                <div className="mb-3">
                  <strong>Initial Value:</strong> ${parseFloat(metal.total).toLocaleString()}
                  <br />
                  <strong>Metal Type:</strong> {metal.type}
                  <br />
                  <strong>Amount:</strong> {metal.grams}g
                  <br />
                  <strong>Projected Value after {timePeriod} years:</strong> ${finalValue.toLocaleString(undefined, {
                    maximumFractionDigits: 0
                  })}
                </div>
                <div style={{ height: '400px' }}>
                  <canvas 
                    ref={el => chartRefs.current[metal.id || index.toString()] = el}
                  />
                </div>
              </Tab>
            );
          })}
        </Tabs>
        <AdvancedVisualizationSettings
          title="Projection Settings"
          settings={settings}
          target={settingsButtonRef}
          show={showSettings}
          onHide={() => setShowSettings(false)}
        />
      </Card.Body>
    </Card>
  );
};

export default MetalsGrowthChart;