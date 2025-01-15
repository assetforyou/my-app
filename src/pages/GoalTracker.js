import React from 'react';
import '../style/Analytics.css';

const sampleGoals = [
  { id: 1, name: 'Retirement Fund', target: 1000000, deadline: '2040' },
  { id: 2, name: 'Emergency Fund', target: 50000, deadline: '2024' },
  { id: 3, name: 'Property Investment', target: 300000, deadline: '2025' }
];

const GoalTracker = ({ goals = sampleGoals, cashTotal, stockTotal, metalTotal, propertyTotal }) => {
  const calculateProgress = (goal) => {
    const totalAssets = cashTotal + stockTotal + metalTotal + propertyTotal;
    return Math.min((totalAssets / goal.target) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'red';
    if (progress < 70) return 'yellow';
    return 'green';
  };

  return (
    <div className="analytics-card">
      <div className="card-content">
        <h3 className="card-title">Financial Goals Progress</h3>
        <div className="goals-container">
          {goals.map(goal => (
            <div key={goal.id} className="goal-item">
              <div className="goal-header">
                <span className="goal-name">{goal.name}</span>
                <span className="goal-target">Target: ${goal.target.toLocaleString()}</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className={`progress-bar progress-${getProgressColor(calculateProgress(goal))}`}
                  style={{ width: `${calculateProgress(goal)}%` }}
                >
                  {calculateProgress(goal).toFixed(1)}%
                </div>
              </div>
              <div className="goal-deadline">Target Date: {goal.deadline}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;
