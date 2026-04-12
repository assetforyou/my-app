import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';

const GoalTracker = ({ goals, cashTotal, stockTotal, metalTotal, propertyTotal }) => {
  const calculateProgress = (goal) => {
    const totalAssets = cashTotal + stockTotal + metalTotal + propertyTotal;
    return Math.min((totalAssets / goal.target) * 100, 100);
  };

  // Sample goals structure
  const sampleGoals = [
    { id: 1, name: 'Retirement Fund', target: 1000000, deadline: '2040' },
    { id: 2, name: 'Emergency Fund', target: 50000, deadline: '2024' },
    { id: 3, name: 'Property Investment', target: 300000, deadline: '2025' }
  ];

  const getVariant = (progress) => {
    if (progress < 30) return 'info';
    if (progress < 70) return 'primary';
    return 'success';
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Financial Goals Progress</h5>
      </Card.Header>
      <Card.Body>
        {sampleGoals.map(goal => (
          <div key={goal.id} className="mb-4">
            <div className="d-flex justify-content-between">
              <span>{goal.name}</span>
              <span>Target: ${goal.target.toLocaleString()}</span>
            </div>
            <ProgressBar 
              now={calculateProgress(goal)} 
              variant={getVariant(calculateProgress(goal))}
              label={`${calculateProgress(goal).toFixed(1)}%`}
              className="mt-2"
            />
            <small className="text-muted">Target Date: {goal.deadline}</small>
          </div>
        ))}
      </Card.Body>
    </Card>
  );
};

export default GoalTracker;