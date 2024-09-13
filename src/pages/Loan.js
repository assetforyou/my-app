import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2 } from 'lucide-react';

function Loan({ userEmail, loanList, loanTotal, fetchLoanDetails }) {
  const [loanDetails, setLoanDetails] = useState({
    type: '',
    loanValue: '',
    purchaseYear: '',
    repaymentPerMonth: '',
    currency: 'USD'
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleSaveLoanDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const loanValue = parseFloat(loanDetails.loanValue);
      const repaymentPerMonth = parseFloat(loanDetails.repaymentPerMonth);
      await addDoc(collection(db, 'loans'), {
        ...loanDetails,
        loanValue,
        repaymentPerMonth,
        userEmail,
      });
      setLoanDetails({ type: '', loanValue: '', purchaseYear: '', repaymentPerMonth: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchLoanDetails(userEmail);
      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving loan details:', error);
      setSaveButtonText('Save');
      alert('Failed to save loan details.');
    }
  };

  const handleDeleteLoan = async (loanId) => {
    if (window.confirm('Are you sure you want to delete this Loan?')) {
      try {
        await deleteDoc(doc(db, 'loans', loanId));
        fetchLoanDetails(userEmail);
        alert('Loan detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting loan detail:', error);
        alert('Failed to delete Loan.');
      }
    }
  };

  return (
    <div className="asset-form">
      <h2>Enter Loan Details</h2>
      <input
        type="text"
        name="type"
        placeholder="Type of Loan"
        value={loanDetails.type}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="loanValue"
        placeholder="Loan Value"
        value={loanDetails.loanValue}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="purchaseYear"
        placeholder="Loan Purchase Year"
        value={loanDetails.purchaseYear}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="repaymentPerMonth"
        placeholder="Repayment per Month"
        value={loanDetails.repaymentPerMonth}
        onChange={handleInputChange}
      />
      <select
        name="currency"
        value={loanDetails.currency}
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
      <button onClick={handleSaveLoanDetails}>{saveButtonText}</button>
      <h2>Total Value of Loans: ${loanTotal.toFixed(2)}</h2>
      <h2>Saved Loan Details</h2>
      <table>
        <thead>
          <tr>
            <th>Type of Loan</th>
            <th>Loan Value</th>
            <th>Loan Purchase Year</th>
            <th>Repayment per Month</th>
            <th>Currency</th>
            <th>User</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loanList.map(loan => (
            <tr key={loan.id}>
              <td>{loan.type}</td>
              <td>${parseFloat(loan.loanValue).toFixed(2)}</td>
              <td>{loan.purchaseYear}</td>
              <td>${parseFloat(loan.repaymentPerMonth).toFixed(2)}</td>
              <td>{loan.currency}</td>
              <td>{loan.userEmail}</td>
              <td>
                <button onClick={() => handleDeleteLoan(loan.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Loan;