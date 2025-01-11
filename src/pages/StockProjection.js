import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card } from 'react-bootstrap';
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
  const selectedStocks = selectedStockIds?.length > 0
    ? stockList.filter(stock => selectedStockIds.includes(stock.id))
    : stockList;

  const generateProjectionData = () => {
    const years = 30;
    const currentYear = new Date().getFullYear();
    const yearLabels = Array.from({ length: years + 1 }, (_, i) => currentYear + i);

    const datasets = selectedStocks.map((stock, stockIndex) => {
      const initialValue = parseFloat(stock.total);
      const growthData = Array.from({ length: years + 1 }, (_, year) => 
        Math.round(initialValue * Math.pow(1.08, year))
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
        <h5 className="mb-0">
          {selectedStocks.length === 1 
            ? `30-Year Projection for ${selectedStocks[0].name}`
            : `30-Year Projection for Selected Stocks`}
        </h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <strong>Projection Details:</strong>
          <ul>
            <li>Annual Growth Rate: 8%</li>
            <li>Time Period: 30 years</li>
            <li>Starting Value: Individual stock totals</li>
          </ul>
        </div>
        <div style={{ height: '400px' }}>
          <Line data={generateProjectionData()} options={chartOptions} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default StockProjection;