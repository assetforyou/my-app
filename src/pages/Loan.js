import React, { useState, useRef, useEffect } from 'react';
import Layout from '../pages/AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table, Dropdown } from 'react-bootstrap';

function Loan({ userEmail, loanList, loanTotal, fetchLoanDetails }) {
  const [localLoanList, setLocalLoanList] = useState(loanList);
  const [loanDetails, setLoanDetails] = useState({
    type: '',
    loanValue: '',
    purchaseYear: '',
    repaymentPerMonth: '',
    currency: 'USD'
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalLoanList(loanList);
  }, [loanList]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleSaveLoanDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const loanValue = parseFloat(loanDetails.loanValue);
      const repaymentPerMonth = parseFloat(loanDetails.repaymentPerMonth);
      const newLoanRef = await addDoc(collection(db, 'loans'), {
        ...loanDetails,
        loanValue,
        repaymentPerMonth,
        userEmail,
      });

      const newLoan = {
        id: newLoanRef.id,
        ...loanDetails,
        loanValue,
        repaymentPerMonth,
        userEmail,
      };
      setLocalLoanList(prevList => [...prevList, newLoan]);

      setLoanDetails({ type: '', loanValue: '', purchaseYear: '', repaymentPerMonth: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
      fetchLoanDetails(userEmail);
    } catch (error) {
      console.error('Error saving loan details:', error);
      setSaveButtonText('Save');
      alert('Failed to save loan details.');
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm('Are you sure you want to delete this Loan?')) {
      try {
        await deleteDoc(doc(db, 'loans', loanId));
        setLocalLoanList(prevList => prevList.filter(loan => loan.id !== loanId));
        fetchLoanDetails(userEmail);
        alert('Loan detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting loan detail:', error);
        alert('Failed to delete Loan.');
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
        setLoanDetails({
          type: firstRow.type || '',
          loanValue: firstRow.loanValue || '',
          purchaseYear: firstRow.purchaseYear || '',
          repaymentPerMonth: firstRow.repaymentPerMonth || '',
          currency: firstRow.currency || 'USD'
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(localLoanList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LoanList");
    XLSX.writeFile(wb, "loan_data.xlsx");
  };

  const chartData = localLoanList.map(loan => ({
    purchaseYear: loan.purchaseYear,
    loanValue: parseFloat(loan.loanValue)
  })).sort((a, b) => a.purchaseYear - b.purchaseYear);

  return (
    <Layout>
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Enter Loan Details
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-advanced">
              <MoreVertical size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                <Upload size={16} className="mr-2" /> Upload Excel
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDownloadData}>
                <Download size={16} className="mr-2" /> Download Data
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="type"
                placeholder="Type of Loan"
                value={loanDetails.type}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="loanValue"
                placeholder="Loan Value"
                value={loanDetails.loanValue}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="purchaseYear"
                placeholder="Loan Purchase Year"
                value={loanDetails.purchaseYear}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="repaymentPerMonth"
                placeholder="Repayment per Month"
                value={loanDetails.repaymentPerMonth}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select
                name="currency"
                value={loanDetails.currency}
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
            <Button variant="primary" onClick={handleSaveLoanDetails}>
              {saveButtonText}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Saved Loan Details</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Type of Loan</th>
                <th>Loan Value</th>
                <th>Loan Purchase Year</th>
                <th>Repayment per Month</th>
                <th>Currency</th>
                <th>User</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {localLoanList.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.type}</td>
                  <td>${parseFloat(loan.loanValue).toFixed(2)}</td>
                  <td>{loan.purchaseYear}</td>
                  <td>${parseFloat(loan.repaymentPerMonth).toFixed(2)}</td>
                  <td>{loan.currency}</td>
                  <td>{loan.userEmail}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteLoan(loan.id)}>
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
        <Card.Header as="h5">Total Value of Loans: ${loanTotal.toFixed(2)}</Card.Header>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Loan Value Over Time</Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="purchaseYear" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="loanValue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
      />
    </div>
    </Layout>
  );
}

export default Loan;