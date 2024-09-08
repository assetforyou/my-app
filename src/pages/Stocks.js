import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = 'your_alpha_vantage_api_key';  // Replace with your actual API key

function Stocks({ userEmail, stockList, stockTotal, fetchStockDetails }) {
  const [stockDetails, setStockDetails] = useState({ name: '', number: '', value: '', currency: 'USD' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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
    const livePrice = await fetchLiveStockPrice(stockDetails.name);
    if (livePrice) {
      const numberOfStocks = parseFloat(stockDetails.number);
      const totalValue = numberOfStocks * livePrice;

      try {
        await addDoc(collection(db, 'stocks'), {
          name: stockDetails.name,
          number: numberOfStocks,
          value: livePrice,
          total: totalValue,
          currency: stockDetails.currency,
          userEmail,
        });

        setStockDetails({ name: '', number: '', value: '', currency: 'USD' });
        fetchStockDetails();
      } catch (error) {
        console.error('Error saving stock details:', error);
        alert('Failed to save stock details.');
      }
    } else {
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
      <button onClick={handleSaveStockDetails}>Save</button>

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
            <th>User</th>
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
              <td>{stock.userEmail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Total Value of Stocks: {stockTotal}</h2>
    </div>
  );
}

export default Stocks;