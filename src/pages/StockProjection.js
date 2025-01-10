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
  // Filter selected stocks
  const selectedStocks = selectedStockIds?.length > 0
    ? stockList.filter(stock => selectedStockIds.includes(stock.id))
    : stockList;

  const generateProjectionData = () => {
    const years = 30;
    const currentYear = new Date().getFullYear();
    const yearLabels = Array.from({ length: years + 1 }, (_, i) => currentYear + i);

    // Generate projections for each selected stock
    const datasets = selectedStocks.map((stock, stockIndex) => {
      const initialValue = parseFloat(stock.total);
      
      // Calculate growth
      const growthData = Array.from({ length: years + 1 }, (_, year) => 
        Math.round(initialValue * Math.pow(1.08, year))
      );

      // Assign a unique color based on index
      const hue = (stockIndex * 137.5) % 360; // Golden ratio hue spacing

      return {
        label: stock.name,
        data: growthData,
        fill: false,
        borderColor: `hsl(${hue}, 70%, 50%)`,
        tension: 0.1,
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
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(value);
          }
        }
      },
      x: {
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
        position: 'bottom'
      }
    }
  };

  // Show message if no stocks are selected
  if (!selectedStocks.length) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-4">Stock Growth Projection</h4>
          <div className="text-center py-4">
            Select one or more stocks to see growth projections
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Body>
        <h4 className="mb-4">
          {selectedStocks.length === 1 
            ? `30-Year Projection for ${selectedStocks[0].name}`
            : `30-Year Projection for Selected Stocks`}
        </h4>

        <div style={{ height: '400px', width: '100%' }}>
          <Line data={generateProjectionData()} options={chartOptions} />
        </div>

        <div className="mt-3 small text-muted">
          * Based on 8% average annual growth rate
        </div>
      </Card.Body>
    </Card>
  );
};

export default StockProjection;