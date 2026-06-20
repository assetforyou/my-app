import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, Copyright } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from '../components/AssetScopeSelect';
import { useAssetScope } from '../utils/useAssetScope';
import '../style/AssetPages.css';

function IntellectualProperty({ userEmail, intellectualPropertyList, setIntellectualPropertyList, intellectualPropertyTotal, fetchIntellectualPropertyDetails, assetFilter = 'all', scopeFilterBanner }) {
  const [scope, setScope] = useAssetScope(assetFilter);
  const [ipDetails, setIpDetails] = useState({
    name: '',
    type: '',
    registrationNumber: '',
    jurisdiction: '',
    registrationDate: '',
    expirationDate: '',
    owner: '',
    purchaseDate: '',
    purchasePrice: '',
    royaltyValue: '',
    annualRoyalties: '',
    licenseType: '',
    licensingAgreement: '',
    valuationMethod: '',
    notes: '',
    currency: 'USD',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const ipTypes = ['Patent', 'Trademark', 'Copyright', 'Trade Secret', 'Domain Name', 'Software License', 'Music Rights', 'Book Rights', 'Film Rights', 'Brand', 'Other'];
  const licenseTypes = ['Exclusive', 'Non-Exclusive', 'Sole', 'Voluntary', 'Compulsory', 'Cross License', 'Sub-license', 'Owned Outright'];
  const valuationMethods = ['Market Value', 'Income Approach', 'Cost Approach', 'Royalty Savings', 'Relief from Royalty', 'Independent Valuation', 'Other'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIpDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveIpDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newIp = {
        ...ipDetails,
        userEmail,
        scope,
        id: Date.now()
      };

      const savedIp = await FirestoreAssetService.addAsset('IntellectualProperty', newIp);
      setIntellectualPropertyList(prev => [...prev, savedIp]);

      setIpDetails({
        name: '',
        type: '',
        registrationNumber: '',
        jurisdiction: '',
        registrationDate: '',
        expirationDate: '',
        owner: '',
        purchaseDate: '',
        purchasePrice: '',
        royaltyValue: '',
        annualRoyalties: '',
        licenseType: '',
        licensingAgreement: '',
        valuationMethod: '',
        notes: '',
        currency: 'USD',
        reminderDate: ''
      });

      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving IP details:', error);
      setSaveButtonText('Save');
      alert('Failed to save intellectual property details.');
    }
  };

  const handleDeleteIp = async (ipId) => {
    if (window.confirm('Are you sure you want to delete this intellectual property entry?')) {
      try {
        await FirestoreAssetService.deleteAsset('IntellectualProperty', ipId, userEmail);
        setIntellectualPropertyList(prev => prev.filter(ip => ip.id !== ipId));
        alert('Intellectual property entry deleted successfully.');
        fetchIntellectualPropertyDetails(userEmail);
      } catch (error) {
        console.error('Error deleting IP entry:', error);
        alert('Failed to delete intellectual property entry.');
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
        setIpDetails({
          name: data[0].name || '',
          type: data[0].type || '',
          registrationNumber: data[0].registrationNumber || '',
          jurisdiction: data[0].jurisdiction || '',
          registrationDate: data[0].registrationDate || '',
          expirationDate: data[0].expirationDate || '',
          owner: data[0].owner || '',
          purchaseDate: data[0].purchaseDate || '',
          purchasePrice: data[0].purchasePrice || '',
          royaltyValue: data[0].royaltyValue || '',
          annualRoyalties: data[0].annualRoyalties || '',
          licenseType: data[0].licenseType || '',
          licensingAgreement: data[0].licensingAgreement || '',
          valuationMethod: data[0].valuationMethod || '',
          notes: data[0].notes || '',
          currency: data[0].currency || 'USD',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(intellectualPropertyList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IntellectualPropertyList");
    XLSX.writeFile(wb, "intellectual_property_data.xlsx");
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
        >
          <option value="">Select IP Type</option>
          {ipTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'licenseType') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select License Type</option>
          {licenseTypes.map(type => (
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

    if (key === 'registrationDate' || key === 'expirationDate' || key === 'purchaseDate' || key === 'reminderDate') {
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
        type={key === 'purchasePrice' || key === 'royaltyValue' || key === 'annualRoyalties' ? 'number' : 'text'}
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
          <Copyright size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Intellectual Property / Royalties</h1>
          <p>Track patents, trademarks, copyrights, royalties and intellectual property assets</p>
        </div>
        {scopeFilterBanner}

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Intellectual Property Details</h5>
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
                  {Object.entries(ipDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveIpDetails} 
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
                 <h5 className="mb-0">Total Intellectual Property Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <Copyright size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${intellectualPropertyTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Your Intellectual Property</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveTable 
                  data={intellectualPropertyList}
                  onDelete={handleDeleteIp}
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

export default IntellectualProperty;