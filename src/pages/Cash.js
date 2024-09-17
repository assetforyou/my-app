import React, { useState, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table } from 'react-bootstrap';

function Cash({ userEmail, cashList, setCashList, cashTotal, fetchCashDetails }) {
  const [cashDetails, setCashDetails] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    transactionDate: '',
    category: '',
    accountType: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCashDetails({ ...cashDetails, [name]: value });
  };

  const handleSaveCashDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const amountInSelectedCurrency = parseFloat(cashDetails.amount);
      const newCashRef = await addDoc(collection(db, 'cash'), {
        ...cashDetails,
        userEmail,
        amount: amountInSelectedCurrency,
      });

      const newCash = {
        id: newCashRef.id,
        ...cashDetails,
        userEmail,
        amount: amountInSelectedCurrency,
      };
      setCashList(prevList => [...prevList, newCash]);

      setCashDetails({
        amount: '',
        currency: 'USD',
        description: '',
        transactionDate: '',
        category: '',
        accountType: '',
        reminderNote: '',
        reminderDate: ''
      });
      setSaveButtonText('Saved!');
      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving cash details:', error);
      setSaveButtonText('Save');
      alert('Failed to save cash details.');
    }
  };

  const handleDeleteCash = async (cashId) => {
    if (window.confirm('Are you sure you want to delete this cash entry?')) {
      try {
        await deleteDoc(doc(db, 'cash', cashId));
        setCashList(prevList => prevList.filter(cash => cash.id !== cashId));
        alert('Cash entry deleted successfully.');
      } catch (error) {
        console.error('Error deleting cash entry:', error);
        alert('Failed to delete cash entry.');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      if (data.length > 0) {
        const firstRow = data[0];
        setCashDetails({
          amount: firstRow.amount || '',
          currency: firstRow.currency || 'USD',
          description: firstRow.description || '',
          transactionDate: firstRow.transactionDate || '',
          category: firstRow.category || '',
          accountType: firstRow.accountType || '',
          reminderNote: firstRow.reminderNote || '',
          reminderDate: firstRow.reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const chartData = cashList.map(cash => ({
    transactionDate: cash.transactionDate,
    amount: parseFloat(cash.amount)
  })).sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header as="h5">Enter Cash Details</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="amount"
                placeholder="Amount"
                value={cashDetails.amount}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select
                name="currency"
                value={cashDetails.currency}
                onChange={handleInputChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
                <option value="INR">INR</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="description"
                placeholder="Description"
                value={cashDetails.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="transactionDate"
                value={cashDetails.transactionDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="category"
                placeholder="Category"
                value={cashDetails.category}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="accountType"
                placeholder="Account Type"
                value={cashDetails.accountType}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="reminderNote"
                placeholder="Reminder Note"
                value={cashDetails.reminderNote}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="reminderDate"
                value={cashDetails.reminderDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSaveCashDetails}>
              {saveButtonText}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Saved Cash Details</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Currency</th>
                <th>Description</th>
                <th>Transaction Date</th>
                <th>Category</th>
                <th>Account Type</th>
                <th>Reminder Note</th>
                <th>Reminder Date</th>
                <th>User</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cashList.map(cash => (
                <tr key={cash.id}>
                  <td>{cash.amount}</td>
                  <td>{cash.currency}</td>
                  <td>{cash.description}</td>
                  <td>{cash.transactionDate}</td>
                  <td>{cash.category}</td>
                  <td>{cash.accountType}</td>
                  <td>{cash.reminderNote}</td>
                  <td>{cash.reminderDate}</td>
                  <td>{cash.userEmail}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteCash(cash.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Total Cash: {cashTotal}</Card.Header>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Cash Transactions Over Time</Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="transactionDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
        />
        <Button
          onClick={() => fileInputRef.current.click()}
          variant="primary"
          className="d-flex align-items-center"
        >
          <Upload size={16} className="mr-2" /> Upload Excel
        </Button>
      </div>
    </div>
  );
}

export default Cash;