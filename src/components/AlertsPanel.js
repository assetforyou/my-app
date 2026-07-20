import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Modal, Form } from 'react-bootstrap';
import { AlertCircle, CheckCircle, Trash2, Plus } from 'lucide-react';
import AlertsService from '../utils/alertsService';
import { useToast } from '../components/Toast';
import '../style/AlertsPanel.css';

function AlertsPanel({ userEmail, portfolio, monthlyIncome, monthlyExpenses }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    severity: 'medium',
    link: '',
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchAlerts();
    // Regenerate alerts periodically
    const timer = setInterval(() => generateAlerts(), 3600000); // hourly
    return () => clearInterval(timer);
  }, [userEmail, portfolio, monthlyIncome, monthlyExpenses]);

  const fetchAlerts = async () => {
    if (!userEmail) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const activeAlerts = await AlertsService.fetchActiveAlerts(userEmail);
      setAlerts(activeAlerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      showError('Error loading alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = async () => {
    try {
      if (!portfolio || portfolio.length === 0) {
        showError('No portfolio data available');
        return;
      }
      await AlertsService.generateAlerts(portfolio, monthlyIncome || 0, monthlyExpenses || 0, userEmail);
      await fetchAlerts();
      success('Alerts generated');
    } catch (err) {
      console.error('Error generating alerts:', err);
      showError('Error generating alerts');
    }
  };

  const handleAddAlert = async () => {
    if (!newAlert.title.trim() || !newAlert.description.trim()) {
      showError('Please add a title and description');
      return;
    }

    try {
      await AlertsService.addAlert({
        ...newAlert,
        userEmail,
        // keep schema-friendly fields
        severity: newAlert.severity || 'medium',
      });
      setShowAddModal(false);
      setNewAlert({ title: '', description: '', severity: 'medium', link: '' });
      await fetchAlerts();
      success('Alert added');
    } catch (err) {
      console.error('Error adding alert:', err);
      showError('Error adding alert');
    }
  };

  const handleDismiss = async (alertId) => {
    try {
      await AlertsService.dismissAlert(alertId);
      setAlerts(alerts.filter((a) => a.id !== alertId));
      success('Alert dismissed');
    } catch (err) {
      console.error('Error dismissing alert:', err);
      showError('Error dismissing alert');
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'danger';
    if (severity === 'medium') return 'warning';
    return 'info';
  };

  if (loading) return <p>Loading alerts...</p>;

  return (
    <div className="alerts-panel">
      <h5 className="mb-3">
        🔔 Alerts & Insights
        <Badge bg="secondary" className="float-end">
          {alerts.length}
        </Badge>
      </h5>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="d-flex align-items-center gap-2"
        >
          <Plus size={16} /> Add Alert
        </Button>

        <Button variant="outline-secondary" size="sm" onClick={generateAlerts}>
          Refresh Alerts
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card className="text-center text-muted p-4">
          <CheckCircle size={32} className="mb-2 text-success mx-auto" />
          <p>No active alerts — great job! 🎉</p>
        </Card>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`alert-card alert-${getSeverityColor(alert.severity)}`}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">
                      <AlertCircle size={18} className="me-2" />
                      {alert.title}
                    </h6>
                    <p className="mb-2 text-muted small">{alert.description}</p>
                    {alert.link && (
                      <a href={alert.link} className="small">
                        View details →
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                    className="p-0"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Add Alert Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                placeholder="e.g., High spending this month"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newAlert.description}
                onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                placeholder="e.g., Consider reducing entertainment spending"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Severity</Form.Label>
              <Form.Select
                value={newAlert.severity}
                onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Link (optional)</Form.Label>
              <Form.Control
                value={newAlert.link}
                onChange={(e) => setNewAlert({ ...newAlert, link: e.target.value })}
                placeholder="e.g., /expenses"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddAlert}>
            Save Alert
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AlertsPanel;
