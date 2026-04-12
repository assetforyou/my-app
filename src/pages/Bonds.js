import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import FirestoreAssetService from '../firestoreAssetService';
import '../style/AssetPages.css';

function Bonds({ userEmail, bondList, setBondList, bondTotal, setBondTotal, fetchBondDetails }) {
  const [bondDetails, setBondDetails] = useState({
    issuer: '',
    bondType: '',
    faceValue: '',
    couponRate: '',
    purchasePrice: '',
    purchaseDate: '',
    maturityDate: '',
    creditRating: '',
    currency: 'USD',
    frequency: 'semi-annual',
    currentValue: '',
    yieldToMaturity: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const BOND_TYPES = [
    'Treasury Bond',
    'Corporate Bond',
    'Municipal Bond',
    'CD / Certificate of Deposit',
    'T-Bill',
    'T-Note',
    'Savings Bond',
    'Agency Bond',
    'Junk Bond',
    'International Bond'
  ];

  const CREDIT_RATINGS = [
    'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-',
    'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-',
    'B+', 'B', 'B-', 'CCC+', 'CCC', 'CCC-',
    'CC', 'C', 'D'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBondDetails(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto calculate current value
      if ((name === 'faceValue' || name === 'couponRate' || name === 'purchasePrice') && 
          updated.faceValue && updated.couponRate && updated.purchasePrice) {
        const face = parseFloat(updated.faceValue) || 0;
        const coupon = parseFloat(updated.couponRate) || 0;
        const price = parseFloat(updated.purchasePrice) || 0;
        updated.currentValue = (face * (coupon / 100)) + ((face - price) / 10);
      }
      
      return updated;
    });
  };

  const handleSaveBondDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newBond = {
        ...bondDetails,
        userEmail,
        id: Date.now()
      };

      const savedBond = await FirestoreAssetService.addAsset('Bonds', newBond);
      setBondList(prev => [...prev, savedBond]);
      setBondTotal(prev => prev + parseFloat(bondDetails.currentValue || 0));

      setBondDetails({
        issuer: '',
        bondType: '',
        faceValue: '',
        couponRate: '',
        purchasePrice: '',
        purchaseDate: '',
        maturityDate: '',
        creditRating: '',
        currency: 'USD',
        frequency: 'semi-annual',
        currentValue: '',
        yieldToMaturity: '',
        reminderNote: '',
        reminderDate: ''
      });

      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving bond details:', error);
      setSaveButtonText('Save');
      alert('Failed to save bond details.');
    }
  };

  const handleDeleteBond = async (bondId) => {
    if (window.confirm('Are you sure you want to delete this bond entry?')) {
      try {
        await FirestoreAssetService.deleteAsset('Bonds', bondId, userEmail);
        setBondList(prev => prev.filter(bond => bond.id !== bondId));
        alert('Bond entry deleted successfully.');
        fetchBondDetails(userEmail);
      } catch (error) {
        console.error('Error deleting bond entry:', error);
        alert('Failed to delete bond entry.');
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
        const entry = data[0];
        setBondDetails({
          issuer: entry.issuer || '',
          bondType: entry.bondType || '',
          faceValue: entry.faceValue || '',
          couponRate: entry.couponRate || '',
          purchasePrice: entry.purchasePrice || '',
          purchaseDate: entry.purchaseDate || '',
          maturityDate: entry.maturityDate || '',
          creditRating: entry.creditRating || '',
          currency: entry.currency || 'USD',
          frequency: entry.frequency || 'semi-annual',
          currentValue: entry.currentValue || '',
          yieldToMaturity: entry.yieldToMaturity || '',
          reminderNote: entry.reminderNote || '',
          reminderDate: entry.reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(bondList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BondList");
    XLSX.writeFile(wb, "bond_data.xlsx");
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

    if (key === 'bondType') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Bond Type</option>
          {BOND_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'creditRating') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Credit Rating</option>
          {CREDIT_RATINGS.map(rating => (
            <option key={rating} value={rating}>{rating}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'frequency') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="annual">Annual</option>
          <option value="semi-annual">Semi-Annual</option>
          <option value="quarterly">Quarterly</option>
          <option value="monthly">Monthly</option>
          <option value="at-maturity">At Maturity Only</option>
        </Form.Select>
      );
    }

    if (key === 'purchaseDate' || key === 'maturityDate' || key === 'reminderDate') {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={key}
          placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={['faceValue', 'couponRate', 'purchasePrice', 'currentValue', 'yieldToMaturity'].includes(key) ? 'number' : 'text'}
        step={key === 'couponRate' || key === 'yieldToMaturity' ? '0.01' : '0.01'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
        onChange={handleInputChange}
        readOnly={key === 'currentValue' || key === 'yieldToMaturity'}
      />
    );
  };

  return (
    <Layout>
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header" style={{ marginBottom: '1.5rem' }}>
          <TrendingUp size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Bonds & Fixed Income</h1>
          <p>Track bonds, CDs, treasuries and fixed income investments</p>
        </div>

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Bond Details</h5>
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
                  {Object.entries(bondDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveBondDetails} 
                      className="w-100"
                    >
                      {saveButtonText}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>

          {/* Table Column */}
          <div className="col-12 col-xl-8">
             <Card className="mb-4 total-value-card">
               <Card.Header>
                 <h5 className="mb-0">Total Bonds Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <TrendingUp size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${bondTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Your Bond Holdings</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveTable 
                  data={bondList}
                  onDelete={handleDeleteBond}
                />
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

export default Bonds;