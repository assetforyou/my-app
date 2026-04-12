import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import LongTermGrowthChart from '../components/CashGrowth';
import FirestoreAssetService from '../firestoreAssetService';
import '../style/AssetPages.css';

function Cash({ userEmail, cashList, setCashList, cashTotal, setCashTotal, fetchCashDetails }) {
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
      const newCash = {
        ...cashDetails,
        userEmail,
        amount: amountInSelectedCurrency,
        id: Date.now() // Generate a unique ID as a number
      };

      const savedCash = await FirestoreAssetService.addAsset('Cash', newCash);
      
      // Update cash list and total
      setCashList(prev => [...prev, savedCash]);
      setCashTotal(prev => prev + amountInSelectedCurrency);

      // Reset form
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
    } catch (error) {
      console.error('Error saving cash details:', error);
      setSaveButtonText('Save');
      alert('Failed to save cash details. Please try again.');
    }
  };

  const handleDeleteCash = async (cashId) => {
    if (!window.confirm('Delete this cash entry?')) return;
    try {
      const success = await FirestoreAssetService.deleteAsset('Cash', cashId, userEmail);
      if (success) {
        console.log('Cash deleted successfully');
        fetchCashDetails(userEmail); // Refresh the cash list after deletion
      } else {
        console.error('Failed to delete cash');
      }
    } catch (error) {
      console.error('Error deleting cash:', error);
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
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header" style={{ marginBottom: '1.5rem' }}>
          <DollarSign size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Cash Assets</h1>
          <p>Track your cash, savings, and liquid assets</p>
        </div>

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
             <Card className="mb-4 total-value-card">
               <Card.Header>
                 <h5 className="mb-0">Total Cash Assets</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <DollarSign size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${cashTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Cash Value Analysis</h5>
              </Card.Header>
              <Card.Body>
                <LongTermGrowthChart cashList={cashList} />
              </Card.Body>
              <ResponsiveTable 
                data={cashList}
                onDelete={handleDeleteCash}
              />
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