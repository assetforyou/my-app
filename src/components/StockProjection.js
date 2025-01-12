import React, { useState } from 'react';
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

const StockProjection = ({ stockList, selectedStockIds }) => {
  const [growthRate, setGrowthRate] = useState(8);
  const [timePeriod, setTimePeriod] = useState(30);
  const { SettingsButton, showSettings, setShowSettings, settingsButtonRef } = useAdvancedSettings();

  const settings = [
    {
      label: 'Growth Rate',
      value: growthRate,
      onChange: setGrowthRate,
      type: 'range',
      min: 1,
      max: 20,
      step: 0.5,
      unit: '%'
    },
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

  const selectedStocks = selectedStockIds?.length > 0
    ? stockList.filter(stock => selectedStockIds.includes(stock.id))
    : stockList;

  const generateProjectionData = () => {
    const currentYear = new Date().getFullYear();
    const yearLabels = Array.from({ length: timePeriod + 1 }, (_, i) => currentYear + i);

    const datasets = selectedStocks.map((stock, stockIndex) => {
      const initialValue = parseFloat(stock.total);
      const growthData = Array.from({ length: timePeriod + 1 }, (_, year) => 
        Math.round(initialValue * Math.pow(1 + (growthRate / 100), year))
      );

      const hue = (stockIndex * 137.5) % 360;
      const color = `hsl(${hue}, 70%, 50%)`;

      return {
        label: stock.name,
        data: growthData,
        fill: true,
        backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`,
        borderColor: color,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      };
    });

    return {
      labels: yearLabels,
      datasets
    };
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
            if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
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
          text: 'Year'
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

  if (!selectedStocks.length) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">Stock Growth Projection</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-4">
            Select one or more stocks to see growth projections
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            {selectedStocks.length === 1 
              ? `${timePeriod}-Year Projection for ${selectedStocks[0].name}`
              : `${timePeriod}-Year Projection for Selected Stocks`}
          </h5>
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
            <li>Annual Growth Rate: {growthRate}%</li>
            <li>Time Period: {timePeriod} years</li>
            <li>Starting Value: Individual stock totals</li>
          </ul>
        </div>
        <div style={{ height: '400px' }}>
          <Line data={generateProjectionData()} options={chartOptions} />
        </div>
        <AdvancedVisualizationSettings
          title="Growth Settings"
          settings={settings}
          target={settingsButtonRef}
          show={showSettings}
          onHide={() => setShowSettings(false)}
        />
      </Card.Body>
    </Card>
  );
};

export default StockProjection;