import React, { useState, useRef, useEffect } from 'react';
import Layout from './AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from './ResponsiveTable';

const ALPHA_VANTAGE_API_KEY = 'L2ETEZ9ROFG567L7';

function Metals({ userEmail, metalList, setMetalList, metalTotal, fetchMetalDetails }) {
  const [metalDetails, setMetalDetails] = useState({
    type: '',
    grams: '',
    currency: 'USD',
    purchaseDate: '',
    valuePerGram: '',
    total: '',
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
      }
      throw new Error('Unexpected API response structure');
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
            return { ...metal, price: null };
          }
        })
      );
      setAvailableMetals(fetchedMetals);
      setFilteredMetals(fetchedMetals);
    } catch (error) {
      setError('Failed to fetch metal prices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetalDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleMetalSelection = (metal) => {
    const selectedMetal = availableMetals.find(m => m.name === metal);
    if (selectedMetal && selectedMetal.price) {
      const valuePerGram = selectedMetal.price / 31.1035; // Convert from oz to gram
      setMetalDetails(prev => ({
        ...prev,
        type: selectedMetal.name,
        valuePerGram,
        total: prev.grams ? prev.grams * valuePerGram : 0
      }));
    }
  };

  const handleSaveMetalDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newMetalRef = await addDoc(collection(db, 'metals'), {
        ...metalDetails,
        userEmail,
        grams: parseFloat(metalDetails.grams),
        valuePerGram: parseFloat(metalDetails.valuePerGram),
        total: parseFloat(metalDetails.total)
      });

      const newMetal = {
        id: newMetalRef.id,
        ...metalDetails,
        userEmail,
      };
      setMetalList(prev => [...prev, newMetal]);

      setMetalDetails({
        type: '',
        grams: '',
        currency: 'USD',
        purchaseDate: '',
        valuePerGram: '',
        total: '',
        reminderNote: '',
        reminderDate: ''
      });
      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
      fetchMetalDetails(userEmail);
    } catch (error) {
      console.error('Error saving metal details:', error);
      setSaveButtonText('Save');
      alert('Failed to save metal details.');
    }
  };

  const handleDeleteMetal = async (metalId) => {
    if (window.confirm('Are you sure you want to delete this metal entry?')) {
      try {
        await deleteDoc(doc(db, 'metals', metalId));
        setMetalList(prev => prev.filter(metal => metal.id !== metalId));
        alert('Metal entry deleted successfully.');
        fetchMetalDetails(userEmail);
      } catch (error) {
        console.error('Error deleting metal entry:', error);
        alert('Failed to delete metal entry.');
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
        setMetalDetails({
          type: data[0].type || '',
          grams: data[0].grams || '',
          currency: data[0].currency || 'USD',
          purchaseDate: data[0].purchaseDate || '',
          valuePerGram: data[0].valuePerGram || '',
          total: data[0].total || '',
          reminderNote: data[0].reminderNote || '',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(metalList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MetalList");
    XLSX.writeFile(wb, "metal_data.xlsx");
  };

  const chartData = metalList
    .map(metal => ({
      purchaseDate: metal.purchaseDate,
      value: parseFloat(metal.total)
    }))
    .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  if (isLoading) return <Layout><div className="container-fluid px-4">Loading metal prices...</div></Layout>;
  if (error) return <Layout><div className="container-fluid px-4">Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="container-fluid px-4">
        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Metal Details</h5>
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
                  <div className="col-12">
                    <Form.Select
                      value={metalDetails.type}
                      onChange={(e) => handleMetalSelection(e.target.value)}
                    >
                      <option value="">Select a metal</option>
                      {filteredMetals.map(metal => (
                        <option key={metal.symbol} value={metal.name}>
                          {metal.name}: {metal.price ? `$${metal.price.toFixed(2)} per oz` : 'Price unavailable'}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  {Object.entries(metalDetails).map(([key, value]) => (
                    key !== 'type' && (
                      <div className="col-12" key={key}>
                        {key === 'currency' ? (
                          <Form.Select
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                          >
                            {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'].map(currency => (
                              <option key={currency} value={currency}>{currency}</option>
                            ))}
                          </Form.Select>
                        ) : (
                          <Form.Control
                            type={key.includes('Date') ? 'date' : ['grams', 'valuePerGram', 'total'].includes(key) ? 'number' : 'text'}
                            name={key}
                            placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            value={value}
                            onChange={handleInputChange}
                            readOnly={['valuePerGram', 'total'].includes(key)}
                          />
                        )}
                      </div>
                    )
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveMetalDetails} 
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
                <h5 className="mb-0">Total Metal Value: ${metalTotal.toFixed(2)}</h5>
              </Card.Header>
            </Card>

            <Card className="mb-4">
              <ResponsiveTable 
                data={metalList}
                onDelete={handleDeleteMetal}
              />
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Metal Value Over Time</h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="purchaseDate" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
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

export default Metals;