import React, { useState, useRef, useCallback } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, Home } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import PropertyGrowthChart from '../components/PropertyGrowth';
import FirestoreAssetService from '../firestoreAssetService';
import { useToast } from '../components/Toast';
import '../style/AssetPages.css';

function Property({ userEmail, propertyList, setPropertyList, propertyTotalPrice, setPropertyTotalPrice, propertyTotalMonthlyCost, setPropertyTotalMonthlyCost, fetchPropertyDetails }) {
  const [propertyDetails, setPropertyDetails] = useState({
    address: '',
    bedrooms: '',
    bathrooms: '',
    basement: '',
    price: '',
    mortgagePayment: '',
    interestRate: '',
    utilities: '',
    otherExpenses: '',
    currency: 'USD',
    purchaseDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [suggestions, setSuggestions] = useState([]);
  const fileInputRef = useRef(null);
  const { success, error: showError, warning } = useToast();

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchSuggestions = useCallback(
    debounce(async (input) => {
      if (input.length > 2) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`);
          const data = await response.json();
          setSuggestions(data.map(item => item.display_name));
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleAddressInputChange = (e) => {
    const { value } = e.target;
    setPropertyDetails(prev => ({ ...prev, address: value }));
    fetchSuggestions(value);
  };

  const handleSuggestionSelect = (suggestion) => {
    setPropertyDetails(prev => ({ ...prev, address: suggestion }));
    setSuggestions([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePropertyDetails = async () => {
    setSaveButtonText('Saving...');
    
    // Validation
    if (!propertyDetails.address.trim()) {
      showError('Please enter a property address');
      setSaveButtonText('Save');
      return;
    }
    
    if (!propertyDetails.price || parseFloat(propertyDetails.price) <= 0) {
      showError('Please enter a valid property price');
      setSaveButtonText('Save');
      return;
    }

    try {
      // Parse numeric fields
      const price = parseFloat(propertyDetails.price);
      const mortgagePayment = parseFloat(propertyDetails.mortgagePayment) || 0;
      const utilities = parseFloat(propertyDetails.utilities) || 0;
      const otherExpenses = parseFloat(propertyDetails.otherExpenses) || 0;

      // Calculate total monthly cost
      const totalMonthlyCost = mortgagePayment + utilities + otherExpenses;

      // Prepare the new property object
      const newProperty = {
        ...propertyDetails,
        userEmail,
        price,
        mortgagePayment,
        utilities,
        otherExpenses,
        totalMonthlyCost,
        id: Date.now() // Generate a unique ID as a number
      };

      // Save the property to Firestore
      const savedProperty = await FirestoreAssetService.addAsset('Properties', newProperty);

      // Update state
      setPropertyList(prev => [...prev, savedProperty]);
      setPropertyTotalPrice(prev => prev + price);
      setPropertyTotalMonthlyCost(prev => prev + totalMonthlyCost);

      // Reset the form
      setPropertyDetails({
        address: '',
        bedrooms: '',
        bathrooms: '',
        basement: '',
        price: '',
        mortgagePayment: '',
        interestRate: '',
        utilities: '',
        otherExpenses: '',
        currency: 'USD',
        purchaseDate: ''
      });

      success('Property added successfully!');
      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (err) {
      console.error('Error saving property details:', err);
      setSaveButtonText('Save');
      showError('Failed to save property details. Please ensure all fields are valid.');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await FirestoreAssetService.deleteAsset('Properties', propertyId, userEmail); // Pass userEmail
        setPropertyList(prev => prev.filter(property => property.id !== propertyId));
        success('Property deleted successfully.');
        fetchPropertyDetails(userEmail);
      } catch (err) {
        console.error('Error deleting property:', err);
        showError('Failed to delete property. Please try again.');
      }
    }
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length > 0) {
          setPropertyDetails({
            address: data[0].address || '',
            bedrooms: data[0].bedrooms || '',
            bathrooms: data[0].bathrooms || '',
            basement: data[0].basement || '',
            price: data[0].price || '',
            mortgagePayment: data[0].mortgagePayment || '',
            interestRate: data[0].interestRate || '',
            utilities: data[0].utilities || '',
            otherExpenses: data[0].otherExpenses || '',
            currency: data[0].currency || 'USD',
            purchaseDate: data[0].purchaseDate || ''
          });
          success('Property data loaded from file successfully');
        } else {
          warning('No data found in the uploaded file');
        }
      } catch (err) {
        console.error('Error reading file:', err);
        showError('Failed to read the uploaded file. Please check the file format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(propertyList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PropertyList");
    XLSX.writeFile(wb, "property_data.xlsx");
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

    if (key === 'purchaseDate' || key === 'reminderDate') {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={key}
          placeholder={key === 'purchaseDate' ? 'Select purchase date' : 'Select reminder date'}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={key === 'price' || key === 'mortgagePayment' || key === 'interestRate' || key === 'utilities' || key === 'otherExpenses' ? 'number' : 'text'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
        onChange={handleInputChange}
        step="0.01" // Allow decimal values
      />
    );
  };

  return (
    <Layout>
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header" style={{ marginBottom: '1.5rem' }}>
          <Home size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Property Assets</h1>
          <p>Track your real estate portfolio with complete details</p>
        </div>

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Property Details</h5>
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
                    <Form.Control
                      type="text"
                      name="address"
                      placeholder="Address"
                      value={propertyDetails.address}
                      onChange={handleAddressInputChange}
                    />
                    {suggestions.length > 0 && (
                      <ul className="list-group mt-2">
                        {suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSuggestionSelect(suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {Object.entries(propertyDetails)
                    .filter(([key]) => key !== 'address')
                    .map(([key, value]) => (
                      <div className="col-12" key={key}>
                        {renderFormControl(key, value)}
                      </div>
                    ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSavePropertyDetails} 
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
                 <h5 className="mb-0">Total Property Portfolio</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <Home size={32} style={{ opacity: 0.9 }} />
                   <div>
                     <div className="amount">${propertyTotalPrice.toFixed(2)}</div>
                     <p style={{ margin: 0, opacity: 0.8, fontSize: '0.875rem' }}>
                       Monthly Cost: ${propertyTotalMonthlyCost.toFixed(2)}
                     </p>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Property Value Analysis</h5>
              </Card.Header>
              <Card.Body>
                <PropertyGrowthChart propertyList={propertyList} />
              </Card.Body>
              <ResponsiveTable 
                data={propertyList}
                onDelete={handleDeleteProperty}
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

export default Property;