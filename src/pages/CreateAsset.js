import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Trash2, Upload, Download, MoreVertical, Plus, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table, Dropdown } from 'react-bootstrap';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from '../components/AssetScopeSelect';
import { useAssetScope } from '../utils/useAssetScope';
import '../style/AssetPages.css';

function CreateAsset({ userEmail, onAssetCreated, assetFilter = 'all', scopeFilterBanner }) {
  const [scope, setScope] = useAssetScope(assetFilter);
  const [assetDetails, setAssetDetails] = useState({
    name: '',
    fields: [{ name: '', type: 'text' }],
    currency: 'USD'
  });
  const [saveButtonText, setSaveButtonText] = useState('Create Asset');
  const fileInputRef = useRef(null);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssetDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleFieldChange = (index, e) => {
    const { name, value } = e.target;
    const newFields = [...assetDetails.fields];
    newFields[index] = { ...newFields[index], [name]: value };
    setAssetDetails(prevDetails => ({ ...prevDetails, fields: newFields }));
  };

  const addField = () => {
    setAssetDetails(prevDetails => ({
      ...prevDetails,
      fields: [...prevDetails.fields, { name: '', type: 'text' }]
    }));
  };

  const removeField = (index) => {
    setAssetDetails(prevDetails => ({
      ...prevDetails,
      fields: prevDetails.fields.filter((_, i) => i !== index)
    }));
  };

  const handleCreateAsset = async () => {
    setSaveButtonText('Creating...');
    try {
      const assetData = {
        ...assetDetails,
        userEmail,
        scope,
        id: Date.now().toString(), // Generate a unique ID for the asset
        totalValue: 0,
        createdAt: new Date().toISOString()
      };
  
      // Save the asset definition to the CustomAssets table
      await FirestoreAssetService.addAsset('CustomAssets', assetData);
  
      onAssetCreated(userEmail);
      setSaveButtonText('Created!');
      setAssetDetails({ name: '', fields: [{ name: '', type: 'text' }], currency: 'USD' });
      setTimeout(() => {
        setSaveButtonText('Create Asset');
      }, 2000);
    } catch (error) {
      console.error('Error creating custom asset:', error);
      alert('Failed to create custom asset.');
      setSaveButtonText('Create Asset');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length > 0) {
        const headers = data[0];
        const fields = headers.map(header => {
          const lowerHeader = header.toLowerCase();
          let type = 'text';
          if (lowerHeader.includes('date')) type = 'date';
          else if (lowerHeader.includes('number') || lowerHeader.includes('cost')) type = 'number';
          return { name: header, type };
        });

        setAssetDetails(prevDetails => ({
          ...prevDetails,
          name: sheetName,
          fields: fields
        }));
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AssetTemplate");
    XLSX.writeFile(wb, "asset_template.xlsx");
  };

  return (
    <Layout>
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header">
          <Sparkles size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Create Custom Asset</h1>
          <p>Define your own asset type with custom fields to track exactly what matters</p>
        </div>
        {scopeFilterBanner}

        <Card className="mb-4 mx-auto" style={{ maxWidth: 720 }}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Asset Configuration</h5>
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-advanced">
                <MoreVertical size={16} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                  <Upload size={16} className="me-2" /> Upload Excel
                </Dropdown.Item>
                <Dropdown.Item onClick={handleDownloadTemplate}>
                  <Download size={16} className="me-2" /> Download Template
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Card.Header>
          <Card.Body>
            <Form>
              <AssetScopeSelect value={scope} onChange={setScope} />
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Asset Name"
                  value={assetDetails.name}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Select
                  name="currency"
                  value={assetDetails.currency}
                  onChange={handleInputChange}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <h6>Fields</h6>
               <h6 style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                 Custom Fields
               </h6>
               
               {assetDetails.fields.map((field, index) => (
                 <div key={index} className="asset-field-row">
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Field Name"
                    value={field.name}
                    onChange={(e) => handleFieldChange(index, e)}
                    className="me-2"
                  />
                  <Form.Select
                    name="type"
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, e)}
                    className="me-2"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="cost">Cost</option>
                  </Form.Select>
                  <Button variant="danger" size="sm" onClick={() => removeField(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
               <Button 
                 variant="secondary" 
                 size="sm" 
                 onClick={addField} 
                 className="mb-4"
                 style={{ width: '100%', fontWeight: 500 }}
               >
                 <Plus size={16} className="me-2" /> Add New Field
               </Button>
               <div className="d-grid">
                 <Button 
                   variant="primary" 
                   onClick={handleCreateAsset}
                   size="lg"
                   style={{ 
                     marginTop: '0.5rem',
                     fontSize: '1rem',
                     fontWeight: 600
                   }}
                 >
                   {saveButtonText}
                 </Button>
               </div>
            </Form>
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

export default CreateAsset;