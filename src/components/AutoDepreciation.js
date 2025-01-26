import React, { useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Button } from 'react-bootstrap';
import { Sliders } from 'lucide-react';
import AdvancedVisualizationSettings, { useAdvancedSettings } from './AdvancedVisualizationSettings';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AutoDepreciation = ({ carList, selectedCarIds }) => {
  const [depreciationRate, setDepreciationRate] = useState(15);
  const [timePeriod, setTimePeriod] = useState(5);
  const { SettingsButton, showSettings, setShowSettings, settingsButtonRef } = useAdvancedSettings();

  const settings = [
    {
      label: 'Depreciation Rate',
      value: depreciationRate,
      onChange: setDepreciationRate,
      type: 'range',
      min: 1,
      max: 50,
      unit: '%'
    },
    {
      label: 'Time Period',
      value: timePeriod,
      onChange: setTimePeriod,
      type: 'range',
      min: 1,
      max: 30,
      unit: ' years'
    }
  ];

  const calculateDepreciation = (initialValue, years) => {
    const depreciation = depreciationRate / 100;
    const values = [];
    let currentValue = initialValue;
    
    for (let i = 0; i <= years; i++) {
      values.push({
        year: i,
        value: currentValue
      });
      currentValue = currentValue * (1 - depreciation);
    }
    return values;
  };

  const yearLabels = Array.from({ length: timePeriod + 1 }, (_, i) => i);

  // Filter cars based on selectedCarIds
  const carsToShow = selectedCarIds?.length > 0 
    ? carList.filter(car => selectedCarIds.includes(car.id))
    : carList;

  // Ensure carList is an array and handle missing/undefined fields
  const allDepreciationData = carsToShow
    .filter(car => car && car.value) // Ensure car and car.value exist
    .map(car => {
      const initialValue = parseFloat(car.value || 0); // Default to 0 if value is missing
      return {
        make: car.make || 'Unknown Make', // Default to 'Unknown Make' if make is missing
        values: calculateDepreciation(initialValue, timePeriod)
      };
    });

  const chartData = {
    labels: yearLabels,
    datasets: allDepreciationData.map((data, index) => {
      const hue = (index * 137.5) % 360;
      return {
        label: data.make,
        data: data.values.map(v => v.value),
        fill: true,
        backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`,
        borderColor: `hsl(${hue}, 70%, 50%)`,
        tension: 0.4,
        borderWidth: 2
      };
    })
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          borderDash: [3, 3]
        },
        ticks: {
          callback: (value) => {
            if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
            if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
            return `$${value}`;
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Years'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(value)}`;
          }
        }
      },
      legend: {
        position: 'top'
      }
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Vehicle Depreciation Projection</h5>
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
          <strong>Depreciation Details:</strong>
          <ul>
            <li>Annual Depreciation Rate: {depreciationRate}%</li>
            <li>Time Period: {timePeriod} years</li>
            <li>Starting Values: Individual vehicle values</li>
          </ul>
        </div>
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>

        <AdvancedVisualizationSettings
          title="Depreciation Settings"
          settings={settings}
          target={settingsButtonRef}
          show={showSettings}
          onHide={() => setShowSettings(false)}
        />
      </Card.Body>
    </Card>
  );
};

export default AutoDepreciation;