import React, { useEffect, useState, useContext } from 'react';
import { Card, Form, Button, Badge, ProgressBar, Modal } from 'react-bootstrap';
import { Plus, Trash2, Target } from 'lucide-react';
import AssetContext from '../context/AssetContext';
import '../style/GoalTrackerComponent.css';

function GoalTracker({ userEmail }) {
  const { portfolio } = useContext(AssetContext);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'savings',
    description: '',
  });

  const loadGoals = async () => {
    // In a real app, this would fetch from Firestore
    const savedGoals = localStorage.getItem(`goals_${userEmail}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  };

  useEffect(() => {
    loadGoals();
  }, [userEmail]);

  const handleAddGoal = () => {
    if (
      !formData.name ||
      !formData.targetAmount ||
      !formData.deadline
    ) {
      alert('Please fill in all required fields');
      return;
    }

    const newGoal = {
      id: Date.now(),
      ...formData,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount || 0),
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${userEmail}`, JSON.stringify(updatedGoals));

    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: 'savings',
      description: '',
    });
    setShowModal(false);
  };

  const handleDeleteGoal = (goalId) => {
    const updatedGoals = goals.filter((g) => g.id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${userEmail}`, JSON.stringify(updatedGoals));
  };

  const handleUpdateProgress = (goalId, newAmount) => {
    const updatedGoals = goals.map((g) =>
      g.id === goalId
        ? { ...g, currentAmount: newAmount }
        : g
    );
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${userEmail}`, JSON.stringify(updatedGoals));
  };

  const calculateDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateRequiredMonthly = (goal) => {
    const daysRemaining = calculateDaysRemaining(goal.deadline);
    const monthsRemaining = daysRemaining / 30;
    if (monthsRemaining <= 0) return 0;
    return (goal.targetAmount - goal.currentAmount) / monthsRemaining;
  };

  const getProgressPercentage = (goal) => {
    if (goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const categoryColors = {
    savings: 'info',
    down_payment: 'primary',
    vacation: 'success',
    education: 'warning',
    retirement: 'danger',
    investment: 'secondary',
    other: 'dark',
  };

  const categoryLabels = {
    savings: '🏦 Emergency Fund / Savings',
    down_payment: '🏠 Down Payment',
    vacation: '✈️ Vacation',
    education: '📚 Education',
    retirement: '🎓 Retirement',
    investment: '📈 Investment',
    other: 'Other',
  };

  return (
    <div className="goal-tracker">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>🎯 Financial Goals</h4>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} className="me-2" />
          New Goal
        </Button>
      </div>

      {/* Goals Summary */}
      <div className="goals-summary mb-4">
        <Card className="summary-card">
          <Card.Body>
            <h6 className="text-muted mb-2">Total Goals</h6>
            <h3>{goals.length}</h3>
          </Card.Body>
        </Card>
        <Card className="summary-card">
          <Card.Body>
            <h6 className="text-muted mb-2">Total Target</h6>
            <h3>
              $
              {goals
                .reduce((sum, g) => sum + g.targetAmount, 0)
                .toLocaleString()}
            </h3>
          </Card.Body>
        </Card>
        <Card className="summary-card">
          <Card.Body>
            <h6 className="text-muted mb-2">Total Saved</h6>
            <h3>
              $
              {goals
                .reduce((sum, g) => sum + g.currentAmount, 0)
                .toLocaleString()}
            </h3>
          </Card.Body>
        </Card>
        <Card className="summary-card">
          <Card.Body>
            <h6 className="text-muted mb-2">Overall Progress</h6>
            <h3>
              {goals.length > 0
                ? (
                    (goals.reduce((sum, g) => sum + g.currentAmount, 0) /
                      goals.reduce((sum, g) => sum + g.targetAmount, 0)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </h3>
          </Card.Body>
        </Card>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="goals-list">
          {goals.map((goal) => (
            <Card key={goal.id} className="goal-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1">{goal.name}</h5>
                    <Badge bg={categoryColors[goal.category]}>
                      {categoryLabels[goal.category] || goal.category}
                    </Badge>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                {goal.description && (
                  <p className="text-muted small mb-3">{goal.description}</p>
                )}

                {/* Progress Bar */}
                <div className="progress-section mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="small">Progress</span>
                    <span className="small text-muted">
                      ${goal.currentAmount.toLocaleString()} / $
                      {goal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar
                    now={getProgressPercentage(goal)}
                    className="goal-progress"
                  />
                  <small className="text-muted">
                    {getProgressPercentage(goal).toFixed(1)}% complete
                  </small>
                </div>

                {/* Deadline Info */}
                <div className="deadline-info mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">Deadline</span>
                    <span className="small">
                      {new Date(goal.deadline).toLocaleDateString()}
                      <Badge bg="warning" className="ms-2">
                        {Math.max(calculateDaysRemaining(goal.deadline), 0)} days
                      </Badge>
                    </span>
                  </div>
                </div>

                {/* Required Monthly */}
                <div className="required-monthly p-2 bg-light rounded">
                  <small className="text-muted">Required monthly to reach goal:</small>
                  <h6 className="mb-0 text-primary">
                    ${calculateRequiredMonthly(goal).toFixed(2)}/month
                  </h6>
                </div>

                {/* Update Progress */}
                <Form.Group className="mt-3">
                  <Form.Label className="small">Update Progress ($)</Form.Label>
                  <div className="input-group input-group-sm">
                    <Form.Control
                      type="number"
                      placeholder="Amount saved"
                      onChange={(e) =>
                        handleUpdateProgress(goal.id, Number(e.target.value))
                      }
                      defaultValue={goal.currentAmount}
                    />
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        const input = event.target.parentElement.querySelector('input');
                        handleUpdateProgress(goal.id, Number(input.value));
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center text-muted p-5">
          <Target size={32} className="mb-3 mx-auto text-secondary" />
          <p>No goals set yet. Create one to get started!</p>
        </Card>
      )}

      {/* Add Goal Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Financial Goal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Goal Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., House Down Payment"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Target Amount ($) *</Form.Label>
            <Form.Control
              type="number"
              placeholder="0"
              value={formData.targetAmount}
              onChange={(e) =>
                setFormData({ ...formData, targetAmount: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Current Amount ($)</Form.Label>
            <Form.Control
              type="number"
              placeholder="0"
              value={formData.currentAmount}
              onChange={(e) =>
                setFormData({ ...formData, currentAmount: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deadline *</Form.Label>
            <Form.Control
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="savings">Emergency Fund / Savings</option>
              <option value="down_payment">Down Payment</option>
              <option value="vacation">Vacation</option>
              <option value="education">Education</option>
              <option value="retirement">Retirement</option>
              <option value="investment">Investment</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Add any notes about this goal..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddGoal}>
            Create Goal
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default GoalTracker;
