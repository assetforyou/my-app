import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Auto({ userEmail, carList, autoTotal, fetchCarDetails }) {
  const [carDetails, setCarDetails] = useState({ make: '', mileage: '', year: '', value: '', currency: 'USD' });
  const [saveButtonText, setSaveButtonText] = useState('Save');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarDetails({ ...carDetails, [name]: value });
  };

  const handleSaveCarDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const carValue = parseFloat(carDetails.value);

      await addDoc(collection(db, 'autos'), {
        ...carDetails,
        userEmail,
        value: carValue,
      });

      setCarDetails({ make: '', mileage: '', year: '', value: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchCarDetails();

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving car details:', error);
      setSaveButtonText('Save');
      alert('Failed to save car details.');
    }
  };

  return (
    <div className="asset-form">
      <h2>Enter Car Details</h2>
      <input
        type="text"
        name="make"
        placeholder="Make"
        value={carDetails.make}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="mileage"
        placeholder="Mileage"
        value={carDetails.mileage}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="year"
        placeholder="Year of Build"
        value={carDetails.year}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="value"
        placeholder="Value"
        value={carDetails.value}
        onChange={handleInputChange}
      />
      <select
        name="currency"
        value={carDetails.currency}
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
      <button onClick={handleSaveCarDetails}>{saveButtonText}</button>

      <h2>Saved Car Details</h2>
      <table>
        <thead>
          <tr>
            <th>Make</th>
            <th>Mileage</th>
            <th>Year</th>
            <th>Value</th>
            <th>Currency</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {carList.map(car => (
            <tr key={car.id}>
              <td>{car.make}</td>
              <td>{car.mileage}</td>
              <td>{car.year}</td>
              <td>{car.value}</td>
              <td>{car.currency}</td>
              <td>{car.userEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total Value of Autos: {autoTotal}</h2>
    </div>
  );
}

export default Auto;