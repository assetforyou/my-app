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

// Register Chart.js components
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
  const calculateDepreciation = (initialValue, years) => {
    const depreciation = 0.15;
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

  // Find the maximum number of years among all cars
  const maxYears = carList.reduce((max, car) => {
    return Math.max(max, car.years || 5); // Default to 5 years if not specified
  }, 0);

  // Generate year labels from 0 to maxYears
  const yearLabels = Array.from({ length: maxYears + 1 }, (_, i) => i);

  // Filter cars based on selection or show all if none selected
  const carsToShow = selectedCarIds?.length > 0 
    ? carList.filter(car => selectedCarIds.includes(car.id))
    : carList;

  // Calculate depreciation for each car
  const allDepreciationData = carsToShow.map(car => {
    const initialValue = parseFloat(car.value);
    const years = car.years || maxYears; // Use car-specific years or maxYears
    return {
      make: car.make,
      values: calculateDepreciation(initialValue, years)
    };
  });

  // Prepare data for the chart
  const chartData = {
    labels: yearLabels,
    datasets: allDepreciationData.map((data, index) => ({
      label: data.make,
      data: data.values.map(v => v.value),
      fill: false,
      borderColor: `hsl(${index * 137.5}, 70%, 50%)`,
      tension: 0.1
    }))
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
        position: 'bottom'
      }
    }
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <div style={{ height: '400px', width: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="mt-3 text-muted small">
          * Based on estimated 15% annual depreciation rate
        </div>
      </Card.Body>
    </Card>
  );
};

export default AutoDepreciation;