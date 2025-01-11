import React, { useState, useRef, useCallback } from 'react';
import Layout from '../components/AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import PropertyGrowthChart from '../components/PropertyGrowth';
function Property({ userEmail, propertyList, setPropertyList, propertyTotalPrice, propertyTotalMonthlyCost, fetchPropertyDetails }) {
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
    try {
      const mortgagePayment = parseFloat(propertyDetails.mortgagePayment);
      const utilities = parseFloat(propertyDetails.utilities);
      const otherExpenses = parseFloat(propertyDetails.otherExpenses);
      const totalMonthlyCost = mortgagePayment + utilities + otherExpenses;
      const price = parseFloat(propertyDetails.price);

      const docRef = await addDoc(collection(db, 'properties'), {
        ...propertyDetails,
        userEmail,
        totalMonthlyCost,
        price,
      });

      const newProperty = {
        id: docRef.id,
        ...propertyDetails,
        userEmail,
        totalMonthlyCost,
        price,
      };

      setPropertyList([...propertyList, newProperty]);
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
      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
      fetchPropertyDetails(userEmail);
    } catch (error) {
      console.error('Error saving property details:', error);
      setSaveButtonText('Save');
      alert('Failed to save property details.');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteDoc(doc(db, 'properties', propertyId));
        setPropertyList(prev => prev.filter(property => property.id !== propertyId));
        alert('Property deleted successfully.');
        fetchPropertyDetails(userEmail);
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property.');
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
        const firstRow = data[0];
        setPropertyDetails({
          address: firstRow.address || '',
          bedrooms: firstRow.bedrooms || '',
          bathrooms: firstRow.bathrooms || '',
          basement: firstRow.basement || '',
          price: firstRow.price || '',
          mortgagePayment: firstRow.mortgagePayment || '',
          interestRate: firstRow.interestRate || '',
          utilities: firstRow.utilities || '',
          otherExpenses: firstRow.otherExpenses || '',
          currency: firstRow.currency || 'USD',
          purchaseDate: firstRow.purchaseDate || ''
        });
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

  const chartData = propertyList
    .map(property => ({
      purchaseDate: property.purchaseDate,
      value: parseFloat(property.price)
    }))
    .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  return (
    <Layout>
      <div className="container-fluid px-4">
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
                                  ['price', 'mortgagePayment', 'interestRate', 'utilities', 'otherExpenses', 'bedrooms', 'bathrooms'].includes(key) ? 'number' : 'text'}
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
            <div className="row g-4">
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Total Property Value: {propertyTotalPrice}</h5>
                    <h5 className="mb-0">Total Monthly Cost: {propertyTotalMonthlyCost}</h5>
                  </Card.Header>
                </Card>
            </div>
            
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Property Value Projection</h5>
              </Card.Header>
              <Card.Body>
                <PropertyGrowthChart propertyList={propertyList} />
              </Card.Body>
            </Card>

            <Card className="my-4">
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