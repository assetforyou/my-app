import React, { useEffect, useState } from 'react';
import { Card, Form, Button, Badge, Table, Modal } from 'react-bootstrap';
import { Plus, Trash2, TrendingDown } from 'lucide-react';
import BillTrackerService from '../utils/billTrackerService';
import { useToast } from '../components/Toast';
import '../style/BillTracker.css';

function BillTracker({ userEmail }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly',
    category: 'subscription',
  });
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchBills();
  }, [userEmail]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const activeBills = await BillTrackerService.fetchActiveBills(userEmail);
      setBills(activeBills);
    } catch (err) {
      console.error('Error fetching bills:', err);
      showError('Error loading bills');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async () => {
    if (!formData.name || !formData.amount) {
      showError('Please fill in all fields');
      return;
    }

    try {
      await BillTrackerService.addBill({
        ...formData,
        amount: Number(formData.amount),
        userEmail,
      });
      success('Bill added successfully!');
      setFormData({ name: '', amount: '', frequency: 'monthly', category: 'subscription' });
      setShowModal(false);
      await fetchBills();
    } catch (err) {
      console.error('Error adding bill:', err);
      showError('Error adding bill');
    }
  };

  const handleDeleteBill = async (billId) => {
    try {
      await BillTrackerService.deleteBill(billId);
      success('Bill deleted');
      await fetchBills();
    } catch (err) {
      console.error('Error deleting bill:', err);
      showError('Error deleting bill');
    }
  };

  // Defensive defaults to avoid hard crashes when data is missing/invalid
  const normalizedBills = Array.isArray(bills) ? bills : [];

  const monthlyTotal = BillTrackerService.calculateMonthlyBills(normalizedBills);

  const reductionOpportunities = BillTrackerService.findReductionOpportunities(normalizedBills);


  const frequencyLabel = {
    daily: '/day',
    weekly: '/week',
    monthly: '/month',
    annual: '/year',
  };

  if (loading) return <p>Loading bills...</p>;

  return (
    <div className="bill-tracker">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>💰 Bills & Subscriptions</h4>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} className="me-2" />
          Add Bill
        </Button>
      </div>

      {/* Monthly Total Card */}
      <Card className="mb-4 total-card">
        <Card.Body>
          <h6 className="text-muted mb-2">Monthly Spend</h6>
          <h2 className="mb-3">${monthlyTotal.toLocaleString()}</h2>
          <small className="text-muted">
            {bills.length} recurring bill{bills.length !== 1 ? 's' : ''}
          </small>
        </Card.Body>
      </Card>

      {/* Reduction Opportunities */}
      {reductionOpportunities.length > 0 && (
        <Card className="mb-4 opportunity-card">
          <Card.Header className="bg-light">
            <h6 className="mb-0">
              <TrendingDown size={18} className="me-2" />
              Potential Savings
            </h6>
          </Card.Header>
          <Card.Body>
            <p className="text-muted small mb-3">
              These bills could be cancelled or reduced:
            </p>
            <div className="opportunities-list">
              {reductionOpportunities.map((opp, idx) => (
                <div key={idx} className="opportunity-item">
                  <span>{opp.name}</span>
                  <Badge bg="success">Save ${opp.amount}/mo</Badge>
                </div>
              ))}
            </div>
            <p className="mt-3 mb-0 small text-muted">
              Total potential savings: <strong>${reductionOpportunities.reduce((sum, o) => sum + o.amount, 0)}/month</strong>
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Bills Table */}
      {bills.length > 0 ? (
        <Card>
          <Card.Header>
            <h6 className="mb-0">Active Bills</h6>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table striped hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Frequency</th>
                    <th>Category</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.name}</td>
                      <td>${bill.amount.toLocaleString()}</td>
                      <td>
                        <Badge bg="info">
                          {bill.frequency}
                        </Badge>
                      </td>
                      <td className="text-muted">{bill.category}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteBill(bill.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="text-center text-muted p-5">
          <p>No bills tracked yet. Add one to get started!</p>
        </Card>
      )}

      {/* Add Bill Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Bill Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Netflix, Gym Membership"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount ($)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Frequency</Form.Label>
            <Form.Select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value })
              }
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="subscription">Subscription</option>
              <option value="utility">Utility</option>
              <option value="insurance">Insurance</option>
              <option value="loan">Loan/Debt</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddBill}>
            Add Bill
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default BillTracker;
