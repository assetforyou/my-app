import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import LoanGrowthChart from '../components/LoanGrowth';
import FirestoreAssetService from '../firestoreAssetService';

function Loan({ userEmail, loanList, setLoanList, loanTotal, setLoanTotal, fetchLoanDetails }) {
  const [loanDetails, setLoanDetails] = useState({
    type: '',
    loanValue: '',
    purchaseDate: '',
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
  
    // If the field is a numeric field, parse it as a float
    if (name === 'loanValue' || name === 'repaymentPerMonth') {
      const parsedValue = parseFloat(value);
      setLoanDetails(prev => ({
        ...prev,
        [name]: isNaN(parsedValue) ? '' : parsedValue, // Only update if the value is a valid number
      }));
    } else {
      setLoanDetails(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveLoanDetails = async () => {
    setSaveButtonText('Saving...');
  
    // Parse and validate numeric fields
    const loanValueInSelectedCurrency = parseFloat(loanDetails.loanValue);
    const repaymentPerMonth = parseFloat(loanDetails.repaymentPerMonth);
  
    // Check if the parsed values are valid numbers
    if (isNaN(loanValueInSelectedCurrency) || isNaN(repaymentPerMonth)) {
      alert('Please enter valid numeric values for Loan Value and Repayment Per Month.');
      setSaveButtonText('Save');
      return;
    }
  
    try {
      const newLoan = {
        ...loanDetails,
        userEmail,
        loanValue: loanValueInSelectedCurrency, // Ensure this is a valid number
        repaymentPerMonth: repaymentPerMonth, // Ensure this is a valid number
        id: Date.now() // Generate a unique ID as a number
      };
  
      const savedLoan = await FirestoreAssetService.addAsset('Loans', newLoan);
      setLoanList(prev => [...prev, savedLoan]);
      setLoanTotal(prev => prev + loanValueInSelectedCurrency); // Update the total loan value
  
      // Reset the form
      setLoanDetails({
        type: '',
        loanValue: '',
        purchaseDate: '',
        repaymentPerMonth: '',
        currency: 'USD',
        description: '',
        category: '',
        reminderNote: '',
        reminderDate: ''
      });
  
      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving loan details:', error);
      setSaveButtonText('Save');
      alert('Failed to save loan details. Please ensure all fields are valid.');
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm('Are you sure you want to delete this loan entry?')) {
      try {
        await FirestoreAssetService.deleteAsset('Loans', loanId, userEmail);
        setLoanList(prev => prev.filter(loan => loan.id !== loanId)); // Use setLoanList
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
          purchaseDate: data[0].purchaseDate || '',
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

    if (key === 'type') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
          className="form-select"
        >
          <option value="">Select Loan Type</option>
          <option value="Personal">Personal Loan</option>
          <option value="Business">Business Loan</option>
          <option value="Mortgage">Mortgage</option>
          <option value="Auto">Auto Loan</option>
          <option value="Student">Student Loan</option>
          <option value="Other">Other</option>
        </Form.Select>
      );
    }

    if (key === 'category') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
          className="form-select"
        >
          <option value="">Select Category</option>
          <option value="ShortTerm">Short Term</option>
          <option value="LongTerm">Long Term</option>
          <option value="Secured">Secured</option>
          <option value="Unsecured">Unsecured</option>
        </Form.Select>
      );
    }

    if (key === 'purchaseDate' || key.includes('Date')) {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={key}
          placeholder={key === 'purchaseDate' ? 'Select Purchase Date' : 'Select Reminder Date'}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    if (key === 'description' || key === 'reminderNote') {
      return (
        <Form.Control
          as="textarea"
          rows={3}
          name={key}
          placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={key === 'loanValue' || key === 'repaymentPerMonth' ? 'number' : 'text'}
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
                      {renderFormControl(key, value)}
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
                <h5 className="mb-0">Total Loans: ${loanTotal.toFixed(2)}</h5>
              </Card.Header>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Loan Value Analysis</h5>
              </Card.Header>
              <Card.Body>
                <LoanGrowthChart loanList={loanList} />
              </Card.Body>
              <ResponsiveTable 
                data={loanList}
                onDelete={handleDeleteLoan}
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

export default Loan;