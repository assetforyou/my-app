import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from '../components/AssetScopeSelect';
import { useAssetScope } from '../utils/useAssetScope';
import '../style/AssetPages.css';

function PrivateEquity({ userEmail, privateEquityList, setPrivateEquityList, privateEquityTotal, fetchPrivateEquityDetails, assetFilter = 'all', scopeFilterBanner }) {
  const [scope, setScope] = useAssetScope(assetFilter);
  const [equityDetails, setEquityDetails] = useState({
    businessName: '',
    industry: '',
    ownershipPercentage: '',
    investmentDate: '',
    initialInvestment: '',
    investmentValue: '',
    annualRevenue: '',
    annualProfit: '',
    businessType: '',
    valuationMethod: '',
    lastValuationDate: '',
    exitStrategy: '',
    numberOfShares: '',
    shareClass: '',
    notes: '',
    currency: 'USD',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const industries = ['Technology', 'Real Estate', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Services', 'Food & Beverage', 'Energy', 'Other'];
  const businessTypes = ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship', 'S-Corp', 'C-Corp', 'Other'];
  const valuationMethods = ['Market Value', 'Book Value', 'Discounted Cash Flow', 'Revenue Multiple', 'Profit Multiple', 'Independent Valuation', 'Other'];
  const exitStrategies = ['Hold', 'Sell', 'IPO', 'Acquisition', 'Merger', 'Liquidation', 'Undecided'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquityDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEquityDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newEquity = {
        ...equityDetails,
        userEmail,
        scope,
        id: Date.now()
      };

      const savedEquity = await FirestoreAssetService.addAsset('PrivateEquity', newEquity);
      setPrivateEquityList(prev => [...prev, savedEquity]);

      setEquityDetails({
        businessName: '',
        industry: '',
        ownershipPercentage: '',
        investmentDate: '',
        initialInvestment: '',
        investmentValue: '',
        annualRevenue: '',
        annualProfit: '',
        businessType: '',
        valuationMethod: '',
        lastValuationDate: '',
        exitStrategy: '',
        numberOfShares: '',
        shareClass: '',
        notes: '',
        currency: 'USD',
        reminderDate: ''
      });

      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving equity details:', error);
      setSaveButtonText('Save');
      alert('Failed to save equity details.');
    }
  };

  const handleDeleteEquity = async (equityId) => {
    if (window.confirm('Are you sure you want to delete this equity entry?')) {
      try {
        await FirestoreAssetService.deleteAsset('PrivateEquity', equityId, userEmail);
        setPrivateEquityList(prev => prev.filter(equity => equity.id !== equityId));
        alert('Equity entry deleted successfully.');
        fetchPrivateEquityDetails(userEmail);
      } catch (error) {
        console.error('Error deleting equity entry:', error);
        alert('Failed to delete equity entry.');
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
        setEquityDetails({
          businessName: data[0].businessName || '',
          industry: data[0].industry || '',
          ownershipPercentage: data[0].ownershipPercentage || '',
          investmentDate: data[0].investmentDate || '',
          initialInvestment: data[0].initialInvestment || '',
          investmentValue: data[0].investmentValue || '',
          annualRevenue: data[0].annualRevenue || '',
          annualProfit: data[0].annualProfit || '',
          businessType: data[0].businessType || '',
          valuationMethod: data[0].valuationMethod || '',
          lastValuationDate: data[0].lastValuationDate || '',
          exitStrategy: data[0].exitStrategy || '',
          numberOfShares: data[0].numberOfShares || '',
          shareClass: data[0].shareClass || '',
          notes: data[0].notes || '',
          currency: data[0].currency || 'USD',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(privateEquityList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PrivateEquityList");
    XLSX.writeFile(wb, "private_equity_data.xlsx");
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

    if (key === 'industry') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'businessType') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Business Type</option>
          {businessTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'valuationMethod') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Valuation Method</option>
          {valuationMethods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'exitStrategy') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Exit Strategy</option>
          {exitStrategies.map(strategy => (
            <option key={strategy} value={strategy}>{strategy}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'investmentDate' || key === 'lastValuationDate' || key === 'reminderDate') {
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

    if (key === 'notes') {
      return (
        <Form.Control
          as="textarea"
          rows={3}
          name={key}
          placeholder="Notes"
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={key === 'ownershipPercentage' || key === 'initialInvestment' || key === 'investmentValue' || key === 'annualRevenue' || key === 'annualProfit' || key === 'numberOfShares' ? 'number' : 'text'}
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
          <Building2 size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Private Business Equity</h1>
          <p>Track private business investments, partnerships and ownership stakes</p>
        </div>
        {scopeFilterBanner}

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Equity Details</h5>
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
                  <div className="col-12">
                    <AssetScopeSelect value={scope} onChange={setScope} />
                  </div>
                  {Object.entries(equityDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveEquityDetails} 
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
                 <h5 className="mb-0">Total Private Equity Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <Building2 size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${privateEquityTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Your Investments</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveTable 
                  data={privateEquityList}
                  onDelete={handleDeleteEquity}
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

export default PrivateEquity;