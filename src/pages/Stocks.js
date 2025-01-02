import React, { useState, useRef } from 'react';
import Layout from '../pages/AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';
import { Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table, Dropdown } from 'react-bootstrap';

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
        await addDoc(collection(db, 'stocks'), {
          ...stockDetails,
          value: livePrice,
          total: totalValue,
          userEmail,
        });

        fetchStockDetails(userEmail);

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
      <Card className="mb-4">
        <Card.Header as="h5">Search Results</Card.Header>
        <Card.Body>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                {result['1. symbol']} - {result['2. name']}
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>
    );
  };
  
  const handleDeleteStock = async (stockId) => {
    if (window.confirm('Are you sure you want to delete this Stock?')) {
      try {
        await deleteDoc(doc(db, 'stocks', stockId));
        setStockList(prevList => prevList.filter(stock => stock.id !== stockId));
        fetchStockDetails(userEmail);
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

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(stockList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockList");
    XLSX.writeFile(wb, "stock_data.xlsx");
  };

  const chartData = stockList.map(stock => ({
    purchaseDate: stock.purchaseDate,
    value: parseFloat(stock.total)
  })).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  return (
    <Layout>
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Enter Stock Details
          <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-advanced">
              <MoreVertical size={16} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                <Upload size={16} className="mr-2" /> Upload Excel
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDownloadData}>
                <Download size={16} className="mr-2" /> Download Data
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="name"
                placeholder="Stock Symbol"
                value={stockDetails.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="number"
                placeholder="Number of Stocks"
                value={stockDetails.number}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select
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
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="purchaseDate"
                value={stockDetails.purchaseDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="sector"
                placeholder="Sector"
                value={stockDetails.sector}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="dividendYield"
                placeholder="Dividend Yield"
                value={stockDetails.dividendYield}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="reminderNote"
                placeholder="Reminder Note"
                value={stockDetails.reminderNote}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="reminderDate"
                value={stockDetails.reminderDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSaveStockDetails}>
              {saveButtonText}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Search for Stocks</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search Stocks"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleSearchStocks}>Search</Button>
        </Card.Body>
      </Card>

      {searchResults.length > 0 && renderStockSearchResults()}

      <Card className="mb-4">
        <Card.Header as="h5">Saved Stock Details</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
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
                    <Button variant="danger" size="sm" onClick={() => handleDeleteStock(stock.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Total Value of Stocks: {stockTotal}</Card.Header>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Stock Value Over Time</Card.Header>
        <Card.Body>
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
        </Card.Body>
      </Card>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
      />
    </div>
    </Layout>
  );
}

export default Stocks;