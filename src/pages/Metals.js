import React, { useState, useRef, useEffect } from 'react';
import Layout from '../pages/AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table, InputGroup, Dropdown } from 'react-bootstrap';

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

      await fetchMetalDetails(userEmail);
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
        setMetalList(prevList => prevList.filter(metal => metal.id !== metalId));
        alert('Metal detail deleted successfully.');
        
        await fetchMetalDetails(userEmail);
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

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(metalList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MetalList");
    XLSX.writeFile(wb, "metal_data.xlsx");
  };

  const chartData = metalList.map(metal => ({
    purchaseDate: metal.purchaseDate,
    value: parseFloat(metal.total)
  })).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  if (isLoading) return <div>Loading metal prices...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          Enter Metal Details
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
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search for metals"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={handleSearch}>Search</Button>
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select onChange={(e) => handleMetalSelection({ name: e.target.value })}>
                <option value="">Select a metal</option>
                {filteredMetals.map(metal => (
                  <option key={metal.symbol} value={metal.name}>
                    {metal.name}: {metal.price ? `$${metal.price.toFixed(2)} per oz` : 'Price unavailable'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="type"
                placeholder="Type of Metal"
                value={metalDetails.type}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="grams"
                placeholder="Grams"
                value={metalDetails.grams}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select
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
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="purchaseDate"
                value={metalDetails.purchaseDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                name="reminderNote"
                placeholder="Reminder Note"
                value={metalDetails.reminderNote}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="date"
                name="reminderDate"
                value={metalDetails.reminderDate}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSaveMetalDetails}>
              {saveButtonText}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Saved Metal Details</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
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
                    <Button variant="danger" size="sm" onClick={() => handleDeleteMetal(metal.id)}>
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
        <Card.Header as="h5">Total Value of Metals: ${metalTotal.toFixed(2)}</Card.Header>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Metal Value Over Time</Card.Header>
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
    
export default Metals;