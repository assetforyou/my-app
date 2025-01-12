import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/AdLayout';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import CustomAssetVisualization from '../components/CustomAssetVisualization';

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
      setTimeout(() => setSaveButtonText('Add Item'), 2000);
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
        alert('Item deleted successfully.');
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
  
  const chartData = assetItems
    .filter(item => {
      const dateField = asset.fields.find(field => field.type === 'date');
      const costField = asset.fields.find(field => field.type === 'cost');
      return item[dateField?.name] && item[costField?.name];
    })
    .map(item => {
      const dateField = asset.fields.find(field => field.type === 'date');
      const costField = asset.fields.find(field => field.type === 'cost');
      return {
        date: item[dateField.name],
        value: parseFloat(item[costField.name])
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const renderFormControl = (field) => {
    if (field.type === 'date') {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={field.name}
          placeholder={`Select ${field.name.toLowerCase()}`}
          value={newItem[field.name] || ''}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={field.type === 'cost' ? 'number' : field.type}
        name={field.name}
        placeholder={field.name}
        value={newItem[field.name] || ''}
        onChange={handleInputChange}
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
                <h5 className="mb-0">Enter {asset.name} Details</h5>
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
                  {asset.fields.map(field => (
                    <div className="col-12" key={field.name}>
                      {renderFormControl(field)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleAddItem} 
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
                <h5 className="mb-0">Total Value: {asset.currency} {totalValue.toFixed(2)}</h5>
              </Card.Header>
            </Card>
            
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Property Value Projection</h5>
              </Card.Header>
              <Card.Body>
              {chartData.length > 0 && (
                <CustomAssetVisualization 
                  assetItems={assetItems}
                  assetFields={asset.fields}
                  assetName={asset.name}
                  currency={asset.currency}
                />
              )}
              </Card.Body>
              <ResponsiveTable 
                data={assetItems}
                onDelete={handleDeleteItem}
                fields={asset.fields}
                currency={asset.currency}
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

export default CustomAsset;