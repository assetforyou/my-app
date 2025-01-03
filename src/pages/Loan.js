import React, { useState, useRef } from 'react';
import Layout from './AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from './ResponsiveTable';

function Loan({ userEmail, loanList, setLoanList, loanTotal, fetchLoanDetails }) {
  const [loanDetails, setLoanDetails] = useState({
    type: '',
    loanValue: '',
    purchaseYear: '',
    repaymentPerMonth: '',
    currency: 'USD',
    description: '',
    category: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveLoanDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const loanValueInSelectedCurrency = parseFloat(loanDetails.loanValue);
      const repaymentPerMonth = parseFloat(loanDetails.repaymentPerMonth);
      const newLoanRef = await addDoc(collection(db, 'loans'), {
        ...loanDetails,
        userEmail,
        loanValue: loanValueInSelectedCurrency,
        repaymentPerMonth,
      });

      const newLoan = {
        id: newLoanRef.id,
        ...loanDetails,
        userEmail,
        loanValue: loanValueInSelectedCurrency,
        repaymentPerMonth,
      };
      setLoanList(prev => [...prev, newLoan]);

      setLoanDetails({
        type: '',
        loanValue: '',
        purchaseYear: '',
        repaymentPerMonth: '',
        currency: 'USD',
        description: '',
        category: '',
        reminderNote: '',
        reminderDate: ''
      });
      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
      fetchLoanDetails(userEmail);
    } catch (error) {
      console.error('Error saving loan details:', error);
      setSaveButtonText('Save');
      alert('Failed to save loan details.');
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm('Are you sure you want to delete this loan entry?')) {
      try {
        await deleteDoc(doc(db, 'loans', loanId));
        setLoanList(prev => prev.filter(loan => loan.id !== loanId));
        alert('Loan entry deleted successfully.');
        fetchLoanDetails(userEmail);
      } catch (error) {
        console.error('Error deleting loan entry:', error);
        alert('Failed to delete loan entry.');
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
        setLoanDetails({
          type: data[0].type || '',
          loanValue: data[0].loanValue || '',
          purchaseYear: data[0].purchaseYear || '',
          repaymentPerMonth: data[0].repaymentPerMonth || '',
          currency: data[0].currency || 'USD',
          description: data[0].description || '',
          category: data[0].category || '',
          reminderNote: data[0].reminderNote || '',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(loanList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LoanList");
    XLSX.writeFile(wb, "loan_data.xlsx");
  };

  const chartData = loanList
    .map(loan => ({
      purchaseYear: loan.purchaseYear,
      loanValue: parseFloat(loan.loanValue)
    }))
    .sort((a, b) => a.purchaseYear - b.purchaseYear);

  return (
    <Layout>
      <div className="container-fluid px-4">
        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Loan Details</h5>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" size="sm">
                    <MoreVertical size={16} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                      <Upload size={16} className="me-2" /> Upload Excel
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDownloadData}>
                      <Download size={16} className="me-2" /> Download Data
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body>
                <Form className="row g-3">
                  {Object.entries(loanDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {key === 'currency' ? (
                        <Form.Select
                          name={key}
                          value={value}
                          onChange={handleInputChange}
                        >
                          {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'].map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                          ))}
                        </Form.Select>
                      ) : (
                        <Form.Control
                          type={key.includes('Date') ? 'date' : 
                                key === 'loanValue' || key === 'repaymentPerMonth' ? 'number' : 
                                key === 'purchaseYear' ? 'number' : 'text'}
                          name={key}
                          placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          value={value}
                          onChange={handleInputChange}
                        />
                      )}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveLoanDetails} 
                      className="w-100"
                    >
                      {saveButtonText}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>

          {/* Table and Charts Column */}
          <div className="col-12 col-xl-8">
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Total Loans: {loanTotal}</h5>
              </Card.Header>
            </Card>

            <Card className="mb-4">
              <ResponsiveTable 
                data={loanList}
                onDelete={handleDeleteLoan}
              />
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Loan Values Over Time</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="purchaseYear" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="loanValue" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

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