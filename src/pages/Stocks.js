import React, { useState, useRef } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';
import { Trash2, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const ALPHA_VANTAGE_API_KEY = 'L2ETEZ9ROFG567L7';  // Replace with your actual API key

function Stocks({ userEmail, stockList, setStockList, stockTotal, fetchStockDetails }) {
  const [stockDetails, setStockDetails] = useState({
    name: '',
    number: '',
    value: '',
    currency: 'USD',
    purchaseDate: '',
    sector: '',
    dividendYield: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStockDetails({ ...stockDetails, [name]: value });
  };

  const fetchLiveStockPrice = async (symbol) => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      const price = parseFloat(response.data['Global Quote']['05. price']);
      return price;
    } catch (error) {
      console.error('Error fetching stock price:', error);
      return null;
    }
  };

  const handleSaveStockDetails = async () => {
    setSaveButtonText('Saving...');
    const livePrice = await fetchLiveStockPrice(stockDetails.name);
    if (livePrice) {
      const numberOfStocks = parseFloat(stockDetails.number);
      const totalValue = numberOfStocks * livePrice;

      try {
        const newStockRef = await addDoc(collection(db, 'stocks'), {
          ...stockDetails,
          value: livePrice,
          total: totalValue,
          userEmail,
        });

        // Update local state immediately
        const newStock = {
          id: newStockRef.id,
          ...stockDetails,
          value: livePrice,
          total: totalValue,
          userEmail,
        };
        setStockList(prevList => [...prevList, newStock]);

        setStockDetails({
          name: '',
          number: '',
          value: '',
          currency: 'USD',
          purchaseDate: '',
          sector: '',
          dividendYield: '',
          reminderNote: '',
          reminderDate: ''
        });
        setSaveButtonText('Saved!');
        setTimeout(() => {
          setSaveButtonText('Save');
        }, 2000);
      } catch (error) {
        console.error('Error saving stock details:', error);
        setSaveButtonText('Save');
        alert('Failed to save stock details.');
      }
    } else {
      setSaveButtonText('Save');
      alert('Failed to fetch live stock price.');
    }
  };

  const handleSearchStocks = async () => {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      setSearchResults(response.data.bestMatches || []);
    } catch (error) {
      console.error('Error searching stocks:', error);
    }
  };

  const renderStockSearchResults = () => {
    return (
      <div>
        <h2>Search Results</h2>
        <ul>
          {searchResults.map((result, index) => (
            <li key={index}>
              {result['1. symbol']} - {result['2. name']}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const handleDeleteStock = async (stockId) => {
    if (window.confirm('Are you sure you want to delete this Stock?')) {
      try {
        await deleteDoc(doc(db, 'stocks', stockId));
        // Update local state immediately
        setStockList(prevList => prevList.filter(stock => stock.id !== stockId));
        alert('Stock detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting Stock detail:', error);
        alert('Failed to delete Stock.');
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
        setStockDetails({
          name: firstRow.name || '',
          number: firstRow.number || '',
          value: firstRow.value || '',
          currency: firstRow.currency || 'USD',
          purchaseDate: firstRow.purchaseDate || '',
          sector: firstRow.sector || '',
          dividendYield: firstRow.dividendYield || '',
          reminderNote: firstRow.reminderNote || '',
          reminderDate: firstRow.reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const chartData = stockList.map(stock => ({
    purchaseDate: stock.purchaseDate,
    value: parseFloat(stock.total)
  })).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  return (
    <div className="asset-form">
      <h2>Enter Stock Details</h2>
      <input
        type="text"
        name="name"
        placeholder="Stock Symbol"
        value={stockDetails.name}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="number"
        placeholder="Number of Stocks"
        value={stockDetails.number}
        onChange={handleInputChange}
      />
      <select
        name="currency"
        value={stockDetails.currency}
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
          value={stockDetails.purchaseDate}
          onChange={handleInputChange}
        />
      </div>
      <input
        type="text"
        name="sector"
        placeholder="Sector"
        value={stockDetails.sector}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="dividendYield"
        placeholder="Dividend Yield"
        value={stockDetails.dividendYield}
        onChange={handleInputChange}
      />
      <div className="form-group">
        <label htmlFor="reminderNote">Reminder Note:</label>
        <input
          type="text"
          id="reminderNote"
          name="reminderNote"
          placeholder="Reminder Note"
          value={stockDetails.reminderNote}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="reminderDate">Reminder Date:</label>
        <input
          type="date"
          id="reminderDate"
          name="reminderDate"
          value={stockDetails.reminderDate}
          onChange={handleInputChange}
        />
      </div>
      <button onClick={handleSaveStockDetails}>{saveButtonText}</button>

      <h2>Search for Stocks</h2>
      <input
        type="text"
        placeholder="Search Stocks"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearchStocks}>Search</button>
      {renderStockSearchResults()}

      <h2>Saved Stock Details</h2>
      <table>
        <thead>
          <tr>
            <th>Stock Name</th>
            <th>Number of Stocks</th>
            <th>Value per Stock</th>
            <th>Total Value</th>
            <th>Currency</th>
            <th>Purchase Date</th>
            <th>Sector</th>
            <th>Dividend Yield</th>
            <th>Reminder Note</th>
            <th>Reminder Date</th>
            <th>User</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stockList.map(stock => (
            <tr key={stock.id}>
              <td>{stock.name}</td>
              <td>{stock.number}</td>
              <td>{stock.value}</td>
              <td>{stock.total}</td>
              <td>{stock.currency}</td>
              <td>{stock.purchaseDate}</td>
              <td>{stock.sector}</td>
              <td>{stock.dividendYield}</td>
              <td>{stock.reminderNote}</td>
              <td>{stock.reminderDate}</td>
              <td>{stock.userEmail}</td>
              <td>
                <button onClick={() => handleDeleteStock(stock.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total Value of Stocks: {stockTotal}</h2>

      <h2>Stock Value Over Time</h2>
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

export default Stocks;