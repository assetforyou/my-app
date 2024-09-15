import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './LandingPage.css';
import { Trash2, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

function CreateAsset({ userEmail, onAssetCreated }) {
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
      await addDoc(collection(db, 'customAssets'), {
        ...assetDetails,
        userEmail,
        totalValue: 0,
      });
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

  return (
    <div className="asset-form-wrapper">
      <div className="asset-form">
        <h2>Create Custom Asset</h2>
        <input
          type="text"
          name="name"
          placeholder="Asset Name"
          value={assetDetails.name}
          onChange={handleInputChange}
        />
        <select
          name="currency"
          value={assetDetails.currency}
          onChange={handleInputChange}
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.code})
            </option>
          ))}
        </select>
        <h3>Fields</h3>
        {assetDetails.fields.map((field, index) => (
          <div key={index} className="field-input">
            <input
              type="text"
              name="name"
              placeholder="Field Name"
              value={field.name}
              onChange={(e) => handleFieldChange(index, e)}
            />
            <select
              name="type"
              value={field.type}
              onChange={(e) => handleFieldChange(index, e)}
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="cost">Cost</option>
            </select>
            <button onClick={() => removeField(index)}><Trash2 size={16} /></button>
          </div>
        ))}
        <button onClick={addField}>Add Field</button>
        <button className="create-asset-button" onClick={handleCreateAsset}>
          {saveButtonText}
        </button>
      </div>
      <div className="upload-excel-container">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
        />
        <button 
          className="upload-excel-button" 
          onClick={() => fileInputRef.current.click()}
        >
          <Upload size={16} /> Upload Excel
        </button>
      </div>
    </div>
  );
}

export default CreateAsset;