import React, { useState, useRef, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table } from 'react-bootstrap';

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

      setPropertyList([...propertyList, {
        id: docRef.id,
        ...propertyDetails,
        userEmail,
        totalMonthlyCost,
        price,
      }]);

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

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving property details:', error);
      setSaveButtonText('Save');
      alert('Failed to save property details.');
    }
  };
  
  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this Property?')) {
      try {
        await deleteDoc(doc(db, 'properties', propertyId));
        setPropertyList(propertyList.filter(property => property.id !== propertyId));
        alert('Property detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting property detail:', error);
        alert('Failed to delete Property.');
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

  const chartData = propertyList.map(property => ({
    purchaseDate: property.purchaseDate,
    value: parseFloat(property.price)
  })).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  return (
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header as="h5">Enter Property Details</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
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
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="bedrooms"
                placeholder="Number of Bedrooms"
                value={propertyDetails.bedrooms}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="bathrooms"
                placeholder="Number of Bathrooms"
                value={propertyDetails.bathrooms}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="basement"
                placeholder="Basement Type"
                value={propertyDetails.basement}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="price"
                placeholder="Price"
                value={propertyDetails.price}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="mortgagePayment"
                placeholder="Mortgage Payment"
                value={propertyDetails.mortgagePayment}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="interestRate"
                placeholder="Interest Rate"
                value={propertyDetails.interestRate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="utilities"
                placeholder="Utilities"
                value={propertyDetails.utilities}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="otherExpenses"
                placeholder="Other Expenses"
                value={propertyDetails.otherExpenses}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select
                name="currency"
                value={propertyDetails.currency}
                onChange={handleInputChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
                <option value="INR">INR</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="purchaseDate"
                value={propertyDetails.purchaseDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSavePropertyDetails}>
              {saveButtonText}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Saved Property Details</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Address</th>
                <th>Bedrooms</th>
                <th>Bathrooms</th>
                <th>Basement Type</th>
                <th>Price</th>
                <th>Mortgage Payment</th>
                <th>Interest Rate</th>
                <th>Utilities</th>
                <th>Other Expenses</th>
                <th>Total Monthly Cost</th>
                <th>Currency</th>
                <th>Purchase Date</th>
                <th>User</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {propertyList.map(property => (
                <tr key={property.id}>
                  <td>{property.address}</td>
                  <td>{property.bedrooms}</td>
                  <td>{property.bathrooms}</td>
                  <td>{property.basement}</td>
                  <td>{property.price}</td>
                  <td>{property.mortgagePayment}</td>
                  <td>{property.interestRate}</td>
                  <td>{property.utilities}</td>
                  <td>{property.otherExpenses}</td>
                  <td>{property.totalMonthlyCost}</td>
                  <td>{property.currency}</td>
                  <td>{property.purchaseDate}</td>
                  <td>{property.userEmail}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteProperty(property.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Total Property Value: {propertyTotalPrice}</Card.Header>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Total Monthly Cost: {propertyTotalMonthlyCost}</Card.Header>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Property Value Over Time</Card.Header>
        <Card.Body>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="purchaseDate" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card.Body>
      </Card>

      <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
        />
        <Button
          onClick={() => fileInputRef.current.click()}
          variant="primary"
          className="d-flex align-items-center"
        >
          <Upload size={16} className="mr-2" /> Upload Excel
        </Button>
      </div>
    </div>
  );
}

export default Property;