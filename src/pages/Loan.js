import React, { useState, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

function Loan({ userEmail, loanList, setLoanList, loanTotal, fetchLoanDetails }) {
  const [loanDetails, setLoanDetails] = useState({
    type: '',
    loanValue: '',
    purchaseYear: '',
    repaymentPerMonth: '',
    currency: 'USD'
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleSaveLoanDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const loanValue = parseFloat(loanDetails.loanValue);
      const repaymentPerMonth = parseFloat(loanDetails.repaymentPerMonth);
      const newLoanRef = await addDoc(collection(db, 'loans'), {
        ...loanDetails,
        loanValue,
        repaymentPerMonth,
        userEmail,
      });

      // Update local state immediately
      const newLoan = {
        id: newLoanRef.id,
        ...loanDetails,
        loanValue,
        repaymentPerMonth,
        userEmail,
      };
      setLoanList(prevList => [...prevList, newLoan]);

      setLoanDetails({ type: '', loanValue: '', purchaseYear: '', repaymentPerMonth: '', currency: 'USD' });
      setSaveButtonText('Saved!');
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
        // Update local state immediately
        setLoanList(prevList => prevList.filter(loan => loan.id !== loanId));
        alert('Loan detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting loan detail:', error);
        alert('Failed to delete Loan.');
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
        setLoanDetails({
          type: firstRow.type || '',
          loanValue: firstRow.loanValue || '',
          purchaseYear: firstRow.purchaseYear || '',
          repaymentPerMonth: firstRow.repaymentPerMonth || '',
          currency: firstRow.currency || 'USD'
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const chartData = loanList.map(loan => ({
    purchaseYear: loan.purchaseYear,
    loanValue: parseFloat(loan.loanValue)
  })).sort((a, b) => a.purchaseYear - b.purchaseYear);

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

      <h2>Total Value of Loans: ${loanTotal.toFixed(2)}</h2>

      <h2>Loan Value Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="purchaseYear" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="loanValue" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <div className="excel-upload">
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="upload-button"
        >
          <Upload size={16} /> Upload Excel
        </button>
      </div>
    </div>
  );
}

export default Loan;