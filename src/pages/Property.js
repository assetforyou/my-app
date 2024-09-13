import React, { useState, useRef, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2 } from 'lucide-react';

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
    currency: 'USD'
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

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

      // Update the UI immediately
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
        currency: 'USD'
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
        // Update the UI immediately
        setPropertyList(propertyList.filter(property => property.id !== propertyId));
        alert('Property detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting property detail:', error);
        alert('Failed to delete Property.');
      }
    }
  };

  return (
    <div className="asset-form">
      <h2>Enter Property Details</h2>
      <div className="autocomplete-wrapper">
        <input
          ref={inputRef}
          type="text"
          name="address"
          placeholder="Address"
          value={propertyDetails.address}
          onChange={handleAddressInputChange}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionSelect(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        type="number"
        name="bedrooms"
        placeholder="Number of Bedrooms"
        value={propertyDetails.bedrooms}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="bathrooms"
        placeholder="Number of Bathrooms"
        value={propertyDetails.bathrooms}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="basement"
        placeholder="Basement Type"
        value={propertyDetails.basement}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={propertyDetails.price}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="mortgagePayment"
        placeholder="Mortgage Payment"
        value={propertyDetails.mortgagePayment}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="interestRate"
        placeholder="Interest Rate"
        value={propertyDetails.interestRate}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="utilities"
        placeholder="Utilities"
        value={propertyDetails.utilities}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="otherExpenses"
        placeholder="Other Expenses"
        value={propertyDetails.otherExpenses}
        onChange={handleInputChange}
      />
      <select
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
      </select>
      <button onClick={handleSavePropertyDetails}>{saveButtonText}</button>

      <h2>Saved Property Details</h2>
      <table>
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
              <td>{property.userEmail}</td>
              <td>
                <button onClick={() => handleDeleteProperty(property.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total Property Value: {propertyTotalPrice}</h2>
      <h2>Total Monthly Cost: {propertyTotalMonthlyCost}</h2>
    </div>
  );
}

export default Property;