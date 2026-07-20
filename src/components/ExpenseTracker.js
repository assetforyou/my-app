import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Modal } from 'react-bootstrap';
import { Plus, DollarSign, TrendingDown } from 'lucide-react';
import { useToast } from '../components/Toast';
import ExpenseService from '../utils/expenseService';
import '../style/ExpenseTracker.css';

function ExpenseTracker({ userEmail }) {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('expense'); // 'expense' or 'income'
  const [formData, setFormData] = useState({ name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();


  const EXPENSE_CATEGORIES = ['Housing', 'Food', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];

  useEffect(() => {
    fetchData();
  }, [userEmail]);

  const fetchData = async () => {
    try {
      const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const expList = await ExpenseService.fetchExpenses(userEmail, startDate, endDate);
      const incList = await ExpenseService.fetchIncome(userEmail, startDate, endDate);

      setExpenses(expList);
      setIncome(incList);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleAddEntry = async () => {
    console.log('[ExpenseTracker] handleAddEntry fired', { modalMode, formData, userEmail, isSaving });

    if (isSaving) return;

    if (!userEmail) {
      console.error('[ExpenseTracker] User not authenticated');
      showError('User not authenticated');
      return;
    }
    if (!formData.name || !formData.amount) {
      console.error('[ExpenseTracker] Validation failed', { name: formData.name, amount: formData.amount });
      showError('Please fill in all fields');
      return;
    }

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error('[ExpenseTracker] Invalid amount', { amount: formData.amount });
      showError('Please enter a valid amount greater than 0');
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === 'expense') {
        const exp = await ExpenseService.addExpense({
          name: formData.name,
          amount: parsedAmount,
          category: formData.category || 'Other',
          date: formData.date,
          userEmail,
        });
        console.log('[ExpenseTracker] addExpense result', exp);
        setExpenses((prev) => [...prev, exp]);
        success('Expense added');
      } else {
        const inc = await ExpenseService.addIncome({
          name: formData.name,
          amount: parsedAmount,
          date: formData.date,
          userEmail,
        });
        console.log('[ExpenseTracker] addIncome result', inc);
        setIncome((prev) => [...prev, inc]);
        success('Income added');
      }

      setFormData({ name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
      setShowModal(false);

      // Refresh so the newly saved item is guaranteed to appear
      await fetchData();
    } catch (err) {
      console.error('[ExpenseTracker] Failed to add entry:', err);
      showError('Failed to add entry');
    } finally {
      setIsSaving(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0);
  const savingsRate = ExpenseService.calculateSavingsRate(totalIncome, totalExpenses);

  return (
    <div className="expense-tracker">
      <h3>💰 Monthly Cashflow</h3>

      {/* Summary Cards */}
      <div className="summary-cards mb-4">
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Total Income</small>
                <div className="display-6 text-success">${totalIncome.toFixed(0)}</div>
              </div>
              <DollarSign size={32} className="text-success opacity-50" />
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Total Expenses</small>
                <div className="display-6 text-danger">${totalExpenses.toFixed(0)}</div>
              </div>
              <TrendingDown size={32} className="text-danger opacity-50" />
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Savings Rate</small>
                <div className="display-6 text-info">{savingsRate}%</div>
              </div>
              <span style={{ fontSize: 32 }}>📈</span>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Add Entry Buttons */}
      <div className="mb-3 d-flex gap-2">
        <Button
          variant="outline-success"
          onClick={() => {
            setFormData({ name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
            setModalMode('income');
            setShowModal(true);
          }}
        >
          <Plus size={18} className="me-1" /> Add Income
        </Button>
        <Button
          variant="outline-danger"
          onClick={() => {
            setFormData({ name: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
            setModalMode('expense');
            setShowModal(true);
          }}
        >
          <Plus size={18} className="me-1" /> Add Expense
        </Button>
      </div>

      {/* Recent Expenses */}
      <Card className="mb-4">
        <Card.Header>Recent Expenses</Card.Header>
        <Table striped size="sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>{e.category}</td>
                <td>{e.name}</td>
                <td className="text-danger">${(e.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  No expenses this month
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Recent Income */}
      <Card className="mb-4">
        <Card.Header>Recent Income</Card.Header>
        <Table striped size="sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {income.map((i) => (
              <tr key={i.id}>
                <td>{new Date(i.date).toLocaleDateString()}</td>
                <td>{i.name}</td>
                <td className="text-success">${(i.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
            {income.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-muted">
                  No income this month
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* Add Entry Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'expense' ? 'Add Expense' : 'Add Income'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handleAddEntry(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Groceries"
              />
            </Form.Group>

            {modalMode === 'expense' && (
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddEntry} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ExpenseTracker;
