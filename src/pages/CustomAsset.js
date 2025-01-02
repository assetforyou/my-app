import React, { useState, useEffect, useRef } from 'react';
import Layout from '../pages/AdLayout';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table, Dropdown } from 'react-bootstrap';

function CustomAsset({ userEmail, asset, fetchCustomAssets, updateAssetTotal }) {
  const [assetItems, setAssetItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [saveButtonText, setSaveButtonText] = useState('Add Item');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAssetItems();
  }, [asset.id]);

  const fetchAssetItems = async () => {
    try {
      const q = query(collection(db, `customAssets/${asset.id}/items`), where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAssetItems(items);
      calculateTotalValue(items);
    } catch (error) {
      console.error('Error fetching custom asset items:', error);
    }
  };

  const calculateTotalValue = (items) => {
    const costField = asset.fields.find(field => field.type === 'cost');
    if (costField) {
      const total = items.reduce((sum, item) => sum + (parseFloat(item[costField.name]) || 0), 0);
      setTotalValue(total);
      updateAssetTotal(asset.id, total);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prevItem => ({ ...prevItem, [name]: value }));
  };

  const handleAddItem = async () => {
    setSaveButtonText('Adding...');
    try {
      await addDoc(collection(db, `customAssets/${asset.id}/items`), {
        ...newItem,
        userEmail,
      });
      await fetchAssetItems();
      setNewItem({});
      setSaveButtonText('Added!');
      setTimeout(() => {
        setSaveButtonText('Add Item');
      }, 2000);
    } catch (error) {
      console.error('Error adding custom asset item:', error);
      alert('Failed to add item.');
      setSaveButtonText('Add Item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, `customAssets/${asset.id}/items`, itemId));
        await fetchAssetItems();
      } catch (error) {
        console.error('Error deleting custom asset item:', error);
        alert('Failed to delete item.');
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
        const newItemData = {};
        asset.fields.forEach(field => {
          newItemData[field.name] = firstRow[field.name] || '';
        });
        setNewItem(newItemData);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(assetItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AssetItems");
    XLSX.writeFile(wb, `${asset.name}_data.xlsx`);
  };

  const getChartData = () => {
    const dateField = asset.fields.find(field => field.type === 'date');
    const costField = asset.fields.find(field => field.type === 'cost');

    if (!dateField || !costField) {
      return [];
    }

    return assetItems
      .filter(item => item[dateField.name] && item[costField.name])
      .map(item => ({
        date: item[dateField.name],
        value: parseFloat(item[costField.name])
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const chartData = getChartData();

  return (
    <Layout>
    <div className="container mt-4">
      <Card className="mb-4">
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          {asset.name}
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
          <h5>Total Value: {asset.currency} {totalValue.toFixed(2)}</h5>
          <Form>
            {asset.fields.map(field => (
              <Form.Group className="mb-3" key={field.name}>
                <Form.Control
                  type={field.type === 'cost' ? 'number' : field.type}
                  name={field.name}
                  placeholder={field.name}
                  value={newItem[field.name] || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            ))}
            <Button variant="primary" onClick={handleAddItem}>
              {saveButtonText}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header as="h5">Saved Items</Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                {asset.fields.map(field => (
                  <th key={field.name}>{field.name}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assetItems.map(item => (
                <tr key={item.id}>
                  {asset.fields.map(field => (
                    <td key={field.name}>
                      {field.type === 'cost' 
                        ? `${asset.currency} ${parseFloat(item[field.name] || 0).toFixed(2)}`
                        : item[field.name]}
                    </td>
                  ))}
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {chartData.length > 0 && (
        <Card className="mb-4">
          <Card.Header as="h5">{asset.name} Value Over Time</Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

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

export default CustomAsset;