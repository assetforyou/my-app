import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Property({ userEmail, propertyList, propertyTotalPrice, propertyTotalMonthlyCost, fetchPropertyDetails }) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyDetails({ ...propertyDetails, [name]: value });
  };

  const handleSavePropertyDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const mortgagePayment = parseFloat(propertyDetails.mortgagePayment);
      const utilities = parseFloat(propertyDetails.utilities);
      const otherExpenses = parseFloat(propertyDetails.otherExpenses);
      const totalMonthlyCost = mortgagePayment + utilities + otherExpenses;

      const price = parseFloat(propertyDetails.price);

      await addDoc(collection(db, 'properties'), {
        ...propertyDetails,
        userEmail,
        totalMonthlyCost,
        price,
      });

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
      fetchPropertyDetails();

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving property details:', error);
      setSaveButtonText('Save');
      alert('Failed to save property details.');
    }
  };

  return (
    <div className="asset-form">
      <h2>Enter Property Details</h2>
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={propertyDetails.address}
        onChange={handleInputChange}
      />
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