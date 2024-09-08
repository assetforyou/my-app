import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Metals({ userEmail, metalList, metalTotal, fetchMetalDetails }) {
  const [metalDetails, setMetalDetails] = useState({ type: '', grams: '', valuePerGram: '', currency: 'USD' });
  const [saveButtonText, setSaveButtonText] = useState('Save');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetalDetails({ ...metalDetails, [name]: value });
  };

  const handleSaveMetalDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const grams = parseFloat(metalDetails.grams);
      const valuePerGram = parseFloat(metalDetails.valuePerGram);
      const totalValue = grams * valuePerGram;

      await addDoc(collection(db, 'metals'), {
        type: metalDetails.type,
        grams,
        valuePerGram,
        total: totalValue,
        currency: metalDetails.currency,
        userEmail,
      });

      setMetalDetails({ type: '', grams: '', valuePerGram: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchMetalDetails();

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving metal details:', error);
      setSaveButtonText('Save');
      alert('Failed to save metal details.');
    }
  };

  return (
    <div className="asset-form">
      <h2>Enter Metal Details</h2>
      <input
        type="text"
        name="type"
        placeholder="Type of Metal"
        value={metalDetails.type}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="grams"
        placeholder="Grams"
        value={metalDetails.grams}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="valuePerGram"
        placeholder="Value per Gram"
        value={metalDetails.valuePerGram}
        onChange={handleInputChange}
      />
      <select
        name="currency"
        value={metalDetails.currency}
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
      <button onClick={handleSaveMetalDetails}>{saveButtonText}</button>

      <h2>Saved Metal Details</h2>
      <table>
        <thead>
          <tr>
            <th>Type of Metal</th>
            <th>Grams</th>
            <th>Value per Gram</th>
            <th>Total Value</th>
            <th>Currency</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {metalList.map(metal => (
            <tr key={metal.id}>
              <td>{metal.type}</td>
              <td>{metal.grams}</td>
              <td>{metal.valuePerGram}</td>
              <td>{metal.total}</td>
              <td>{metal.currency}</td>
              <td>{metal.userEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total Value of Metals: {metalTotal}</h2>
    </div>
  );
}

export default Metals;