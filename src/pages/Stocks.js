import React, { useState, useRef } from 'react';
import Layout from './AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import axios from 'axios';
import { Upload, Download, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from './ResponsiveTable';
import StockProjection from './StockProjection';
const ALPHA_VANTAGE_API_KEY = 'YOUR_API_KEY'; // Replace with your API key

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
  const [selectedStockIds, setSelectedStockIds] = useState([]);
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStockDetails(prev => ({ ...prev, [name]: value }));
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

        const newStock = {
          id: newStockRef.id,
          ...stockDetails,
          value: livePrice,
          total: totalValue,
          userEmail,
        };
        setStockList(prev => [...prev, newStock]);

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
        setTimeout(() => setSaveButtonText('Save'), 2000);
        fetchStockDetails(userEmail);
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

  const handleStockSelect = (stockId) => {
    setSelectedStockIds(prev => {
      if (prev.includes(stockId)) {
        return prev.filter(id => id !== stockId);
      } else {
        return [...prev, stockId];
      }
    });
  };

  const handleDeleteStock = async (stockId) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      try {
        await deleteDoc(doc(db, 'stocks', stockId));
        setStockList(prev => prev.filter(stock => stock.id !== stockId));
        if (selectedStockIds === stockId) {
          setSelectedStockIds(null);
        }
        alert('Stock entry deleted successfully.');
        fetchStockDetails(userEmail);
      } catch (error) {
        console.error('Error deleting stock entry:', error);
        alert('Failed to delete stock entry.');
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
        setStockDetails({
          name: data[0].name || '',
          number: data[0].number || '',
          value: data[0].value || '',
          currency: data[0].currency || 'USD',
          purchaseDate: data[0].purchaseDate || '',
          sector: data[0].sector || '',
          dividendYield: data[0].dividendYield || '',
          reminderNote: data[0].reminderNote || '',
          reminderDate: data[0].reminderDate || ''
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

  const renderFormControl = (key, value) => {
    if (key === 'currency') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'].map(currency => (
            <option key={currency} value={currency}>{currency}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'purchaseDate' || key === 'reminderDate') {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={key}
          placeholder={key === 'purchaseDate' ? 'Select purchase date' : 'Select reminder date'}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    if (key === 'sector') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Sector</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Finance">Finance</option>
          <option value="Consumer">Consumer</option>
          <option value="Industrial">Industrial</option>
          <option value="Energy">Energy</option>
          <option value="Materials">Materials</option>
          <option value="Utilities">Utilities</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Communication">Communication</option>
        </Form.Select>
      );
    }

    return (
      <Form.Control
        type={key === 'number' ? 'number' : 'text'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
        onChange={handleInputChange}
        disabled={key === 'value'}
      />
    );
  };

  return (
    <Layout>
      <div className="container-fluid px-4">
        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Stock Details</h5>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" size="sm">
                    <MoreVertical size={16} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => fileInputRef.current.click()}>
                      <Upload size={16} className="me-2" /> Upload Excel
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleDownloadData}>
                      <Download size={16} className="me-2" /> Download Data
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Card.Header>
              <Card.Body>
                <Form className="row g-3">
                  {/* Stock Symbol Search */}
                  <div className="col-12">
                    <Form.Control
                      type="text"
                      placeholder="Search Stock Symbol"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button 
                      variant="secondary" 
                      onClick={handleSearchStocks}
                      className="mt-2 w-100"
                    >
                      Search
                    </Button>
                    {searchResults.length > 0 && (
                      <div className="mt-2 border rounded p-2">
                        {searchResults.map((result, index) => (
                          <div 
                            key={index}
                            className="cursor-pointer p-1 hover:bg-gray-100"
                            onClick={() => {
                              setStockDetails(prev => ({
                                ...prev,
                                name: result['1. symbol']
                              }));
                              setSearchResults([]);
                              setSearchQuery('');
                            }}
                          >
                            {result['1. symbol']} - {result['2. name']}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {Object.entries(stockDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveStockDetails} 
                      className="w-100"
                    >
                      {saveButtonText}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>

          {/* Table and Charts Column */}
          <div className="col-12 col-xl-8">
          <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  {selectedStockIds.length > 0 
                    ? `Selected Stock Value: $${stockList
                        .filter(s => selectedStockIds.includes(s.id))
                        .reduce((sum, stock) => sum + stock.total, 0)
                        .toLocaleString()}`
                    : `Total Portfolio Value: ${stockTotal}`
                  }
                </h5>
              </Card.Header>
            </Card>

            {/* Stock Growth Component */}
            <StockProjection 
              stockList={stockList} 
              selectedStockIds={selectedStockIds}
            />

            {/* Responsive Table */}
            <Card className="mb-4">
              <ResponsiveTable 
                data={stockList}
                onDelete={handleDeleteStock}
                onSelect={handleStockSelect}
                selectedStockIds={selectedStockIds}
              />
            </Card>
          </div>
        </div>

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