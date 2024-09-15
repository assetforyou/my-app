import React, { useState, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

function Auto({ userEmail, carList, setCarList, autoTotal, fetchCarDetails }) {
  const [carDetails, setCarDetails] = useState({
    make: '',
    mileage: '',
    year: '',
    value: '',
    currency: 'USD',
    purchaseDate: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarDetails({ ...carDetails, [name]: value });
  };

  const handleSaveCarDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const carValue = parseFloat(carDetails.value);
      const newCarRef = await addDoc(collection(db, 'autos'), {
        ...carDetails,
        userEmail,
        value: carValue,
      });

      // Update local state immediately
      const newCar = {
        id: newCarRef.id,
        ...carDetails,
        userEmail,
        value: carValue,
      };
      setCarList(prevList => [...prevList, newCar]);

      setCarDetails({
        make: '',
        mileage: '',
        year: '',
        value: '',
        currency: 'USD',
        purchaseDate: '',
        reminderNote: '',
        reminderDate: ''
      });
      setSaveButtonText('Saved!');
      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving car details:', error);
      setSaveButtonText('Save');
      alert('Failed to save car details.');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteDoc(doc(db, 'autos', carId));
        // Update local state immediately
        setCarList(prevList => prevList.filter(car => car.id !== carId));
        alert('Car deleted successfully.');
      } catch (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete car.');
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
        setCarDetails({
          make: firstRow.make || '',
          mileage: firstRow.mileage || '',
          year: firstRow.year || '',
          value: firstRow.value || '',
          currency: firstRow.currency || 'USD',
          purchaseDate: firstRow.purchaseDate || '',
          reminderNote: firstRow.reminderNote || '',
          reminderDate: firstRow.reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const chartData = carList.map(car => ({
    purchaseDate: car.purchaseDate,
    value: parseFloat(car.value)
  })).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

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
      <div className="form-group">
        <label htmlFor="purchaseDate">Purchase Date:</label>
        <input
          type="date"
          id="purchaseDate"
          name="purchaseDate"
          value={carDetails.purchaseDate}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="reminderNote">Reminder Note:</label>
        <input
          type="text"
          id="reminderNote"
          name="reminderNote"
          placeholder="Reminder Note"
          value={carDetails.reminderNote}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="reminderDate">Reminder Date:</label>
        <input
          type="date"
          id="reminderDate"
          name="reminderDate"
          value={carDetails.reminderDate}
          onChange={handleInputChange}
        />
      </div>
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
            <th>Purchase Date</th>
            <th>Reminder Note</th>
            <th>Reminder Date</th>
            <th>User</th>
            <th>Action</th>
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
              <td>{car.purchaseDate}</td>
              <td>{car.reminderNote}</td>
              <td>{car.reminderDate}</td>
              <td>{car.userEmail}</td>
              <td>
                <button onClick={() => handleDeleteCar(car.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total Value of Autos: {autoTotal}</h2>

      <h2>Car Value Over Time</h2>
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

export default Auto;