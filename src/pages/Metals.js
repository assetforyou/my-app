import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

const ALPHA_VANTAGE_API_KEY = 'L2ETEZ9ROFG567L7';

function Metals({ userEmail, metalList, setMetalList, metalTotal, fetchMetalDetails }) {
  const [metalDetails, setMetalDetails] = useState({
    type: '',
    grams: '',
    currency: 'USD',
    purchaseDate: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [availableMetals, setAvailableMetals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMetals, setFilteredMetals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAvailableMetals();
  }, []);

  const fetchMetalPrice = async (symbol) => {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
      const data = await response.json();
      if (data['Global Quote'] && data['Global Quote']['05. price']) {
        return parseFloat(data['Global Quote']['05. price']);
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  };

  const fetchAvailableMetals = async () => {
    setIsLoading(true);
    setError(null);
    const metals = [
      { symbol: 'XAUUSD', name: 'Gold' },
      { symbol: 'XAGUSD', name: 'Silver' },
      { symbol: 'XPTUSD', name: 'Platinum' },
      { symbol: 'PALL', name: 'Palladium' }
    ];

    try {
      const fetchedMetals = await Promise.all(
        metals.map(async (metal) => {
          try {
            const price = await fetchMetalPrice(metal.symbol);
            return { ...metal, price };
          } catch (error) {
            console.error(`Failed to fetch price for ${metal.name}:`, error);
            return { ...metal, price: null };
          }
        })
      );
      console.log('Fetched metals:', fetchedMetals);
      setAvailableMetals(fetchedMetals);
      setFilteredMetals(fetchedMetals);
    } catch (error) {
      console.error('Error fetching metal prices:', error);
      setError('Failed to fetch metal prices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetalDetails(prevDetails => ({ ...prevDetails, [name]: value }));
  };

  const handleSearch = () => {
    const filtered = availableMetals.filter(metal => 
      metal.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMetals(filtered);
  };

  const handleMetalSelection = (metal) => {
    setMetalDetails(prevDetails => ({
      ...prevDetails,
      type: metal.name,
    }));
  };

  const handleSaveMetalDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const grams = parseFloat(metalDetails.grams);
      const selectedMetal = availableMetals.find(metal => metal.name.toLowerCase() === metalDetails.type.toLowerCase());
      const valuePerGram = selectedMetal && selectedMetal.price ? (selectedMetal.price / 31.1035) : 0;
      const total = grams * valuePerGram;
      const newMetalRef = await addDoc(collection(db, 'metals'), {
        ...metalDetails,
        grams,
        valuePerGram,
        total,
        userEmail,
      });

      // Update local state immediately
      const newMetal = {
        id: newMetalRef.id,
        ...metalDetails,
        grams,
        valuePerGram,
        total,
        userEmail,
      };
      setMetalList(prevList => [...prevList, newMetal]);

      setMetalDetails({
        type: '',
        grams: '',
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
      console.error('Error saving metal details:', error);
      setSaveButtonText('Save');
      alert('Failed to save metal details.');
    }
  };

  const handleDeleteMetal = async (metalId) => {
    if (window.confirm('Are you sure you want to delete this Metal?')) {
      try {
        await deleteDoc(doc(db, 'metals', metalId));
        // Update local state immediately
        setMetalList(prevList => prevList.filter(metal => metal.id !== metalId));
        alert('Metal detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting metal detail:', error);
        alert('Failed to delete Metal.');
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
        setMetalDetails({
          type: firstRow.type || '',
          grams: firstRow.grams || '',
          currency: firstRow.currency || 'USD',
          purchaseDate: firstRow.purchaseDate || '',
          reminderNote: firstRow.reminderNote || '',
          reminderDate: firstRow.reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const chartData = metalList.map(metal => ({
    purchaseDate: metal.purchaseDate,
    value: parseFloat(metal.total)
  })).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  if (isLoading) return <div>Loading metal prices...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="asset-form">
      <h2>Enter Metal Details</h2>
      <div>
        <input
          type="text"
          placeholder="Search for metals"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <ul>
        {filteredMetals.map(metal => (
          <li key={metal.symbol} onClick={() => handleMetalSelection(metal)}>
            {metal.name}: {metal.price ? `$${metal.price.toFixed(2)} per oz` : 'Price unavailable'}
          </li>
        ))}
      </ul>
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
      <div className="form-group">
        <label htmlFor="purchaseDate">Purchase Date:</label>
        <input
          type="date"
          id="purchaseDate"
          name="purchaseDate"
          value={metalDetails.purchaseDate}
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
          value={metalDetails.reminderNote}
          onChange={handleInputChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="reminderDate">Reminder Date:</label>
        <input
          type="date"
          id="reminderDate"
          name="reminderDate"
          value={metalDetails.reminderDate}
          onChange={handleInputChange}
        />
      </div>
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
            <th>Purchase Date</th>
            <th>Reminder Note</th>
            <th>Reminder Date</th>
            <th>User</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {metalList.map(metal => (
            <tr key={metal.id}>
              <td>{metal.type}</td>
              <td>{metal.grams}</td>
              <td>${metal.valuePerGram.toFixed(2)}</td>
              <td>${metal.total.toFixed(2)}</td>
              <td>{metal.currency}</td>
              <td>{metal.purchaseDate}</td>
              <td>{metal.reminderNote}</td>
              <td>{metal.reminderDate}</td>
              <td>{metal.userEmail}</td>
              <td>
                <button onClick={() => handleDeleteMetal(metal.id)}><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total Value of Metals: ${metalTotal.toFixed(2)}</h2>

      <h2>Metal Value Over Time</h2>
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

export default Metals;