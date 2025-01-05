import React, { useState, useRef } from 'react';
import Layout from './AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from './ResponsiveTable';
import CashGrowth from './CashGrowth';

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
    setCashDetails(prev => ({ ...prev, [name]: value }));
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
      setCashList(prev => [...prev, newCash]);

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
      setTimeout(() => setSaveButtonText('Save'), 2000);
      fetchCashDetails(userEmail);
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
        setCashList(prev => prev.filter(cash => cash.id !== cashId));
        alert('Cash entry deleted successfully.');
        fetchCashDetails(userEmail);
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
        setCashDetails({
          amount: data[0].amount || '',
          currency: data[0].currency || 'USD',
          description: data[0].description || '',
          transactionDate: data[0].transactionDate || '',
          category: data[0].category || '',
          accountType: data[0].accountType || '',
          reminderNote: data[0].reminderNote || '',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(cashList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CashList");
    XLSX.writeFile(wb, "cash_data.xlsx");
  };

  const chartData = cashList
    .map(cash => {
      // Get the date without timezone offset
      const date = new Date(cash.transactionDate);
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return {
        transactionDate: localDate.toISOString().split('T')[0],
        amount: parseFloat(cash.amount)
      };
    })
    .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));

  const renderFormControl = (key, value) => {
    if (key === 'currency') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'].map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'transactionDate' || key === 'reminderDate') {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={key}
          placeholder={key === 'transactionDate' ? 'Select transaction date' : 'Select reminder date'}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={key === 'amount' ? 'number' : 'text'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
        onChange={handleInputChange}
      />
    );
  };

  return (
    <Layout>
      <div className="container-fluid px-4">
        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Cash Details</h5>
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
                  {Object.entries(cashDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveCashDetails} 
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
                <h5 className="mb-0">Total Cash: {cashTotal}</h5>
              </Card.Header>
              {/* Add CashGrowth component here */}
              <CashGrowth cashList={cashList} />
            </Card>

            <Card className="mb-4">
              <ResponsiveTable 
                data={cashList}
                onDelete={handleDeleteCash}
              />
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Cash Transactions Over Time</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="transactionDate" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" />
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

export default Cash;