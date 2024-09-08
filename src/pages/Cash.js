import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Cash({ userEmail, cashList, cashTotal, fetchCashDetails }) {
  const [cashDetails, setCashDetails] = useState({ amount: '', currency: 'USD' });
  const [saveButtonText, setSaveButtonText] = useState('Save');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCashDetails({ ...cashDetails, [name]: value });
  };

  const handleSaveCashDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const amountInSelectedCurrency = parseFloat(cashDetails.amount);

      await addDoc(collection(db, 'cash'), {
        amount: amountInSelectedCurrency,
        currency: cashDetails.currency,
        userEmail,
      });

      setCashDetails({ amount: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchCashDetails();

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving cash details:', error);
      setSaveButtonText('Save');
      alert('Failed to save cash details.');
    }
  };

  return (
    <div className="asset-form">
      <h2>Enter Cash Details</h2>
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={cashDetails.amount}
        onChange={handleInputChange}
      />
      <select
        name="currency"
        value={cashDetails.currency}
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
      <button onClick={handleSaveCashDetails}>{saveButtonText}</button>

      <h2>Saved Cash Details</h2>
      <table>
        <thead>
          <tr>
            <th>Amount</th>
            <th>Currency</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {cashList.map(cash => (
            <tr key={cash.id}>
              <td>{cash.amount}</td>
              <td>{cash.currency}</td>
              <td>{cash.userEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total in Selected Currency: {cashTotal}</h2>
    </div>
  );
}

export default Cash;