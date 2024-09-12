import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const ALPHA_VANTAGE_API_KEY = 'L2ETEZ9ROFG567L7';

function Metals({ userEmail, metalList, metalTotal, fetchMetalDetails }) {
  const [metalDetails, setMetalDetails] = useState({ type: '', grams: '', currency: 'USD' });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [availableMetals, setAvailableMetals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMetals, setFilteredMetals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      await addDoc(collection(db, 'metals'), {
        type: metalDetails.type,
        grams,
        valuePerGram,
        total,
        currency: metalDetails.currency,
        userEmail,
      });
      setMetalDetails({ type: '', grams: '', currency: 'USD' });
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

  if (isLoading) return <div>Loading metal prices...</div>;
  if (error) return <div>Error: {error}</div>;
  
  const handleDeleteMetal = async (metalId) => {
    if (window.confirm('Are you sure you want to delete this Metal?')) {
      try {
        await deleteDoc(doc(db, 'metals', metalId));
        fetchMetalDetails();
        alert('Metal detail deleted successfully.');
      } catch (error) {
        console.error('Error deleting metal detail:', error);
        alert('Failed to delete Metal.');
      }
    }
  };

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
      <button onClick={handleSaveMetalDetails}>{saveButtonText}</button>
      <h2>Total Value of Metals: ${metalTotal.toFixed(2)}</h2>
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
              <td>{metal.userEmail}</td>
              <td>
                <button onClick={() => handleDeleteMetal(metal.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Metals;