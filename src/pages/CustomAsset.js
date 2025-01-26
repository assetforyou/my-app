import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import CustomAssetVisualization from '../components/CustomAssetVisualization';
import DynamoDBService from '../dynamoDBService';

function CustomAsset({ userEmail, asset, fetchCustomAssets, updateAssetTotal }) {
  const [assetItems, setAssetItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [saveButtonText, setSaveButtonText] = useState('Add Item');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (asset) {
      fetchAssetItems();
    }
  }, [asset.id]); // Re-fetch items when asset.id changes
  
  const fetchAssetItems = async () => {
    try {
      // Fetch the asset definition from the CustomAssets table
      const assetDefinition = await DynamoDBService.fetchAssetById('CustomAssets', asset.id);
      console.log('Asset Definition:', assetDefinition);
  
      // Fetch all items for the custom asset from the CustomAssetItems table
      const items = await DynamoDBService.fetchAssetItems('CustomAssetItems', asset.id);
      console.log('Fetched Items:', items);
  
      setAssetItems(items);
      calculateTotalValue(items);
    } catch (error) {
      console.error('Error fetching custom asset items:', error);
    }
  };
  
  const handleAddItem = async () => {
    setSaveButtonText('Adding...');
    try {
      const newItemWithId = {
        ...newItem,
        userEmail,
        assetId: asset.id, // Link to the asset definition
        id: Date.now().toString(), // Generate a unique ID for the item
        createdAt: new Date().toISOString()
      };
  
      // Save the item to the CustomAssetItems table
      const savedItem = await DynamoDBService.addAssetItem('CustomAssetItems', newItemWithId);
      setAssetItems(prev => [...prev, savedItem]);
      setNewItem({});
      setSaveButtonText('Added!');
      setTimeout(() => setSaveButtonText('Add Item'), 2000);
    } catch (error) {
      console.error('Error adding custom asset item:', error);
      alert('Failed to add item.');
      setSaveButtonText('Add Item');
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


  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        console.log('Deleting item with ID:', itemId); // Debugging log
        console.log('User email:', userEmail); // Debugging log
  
        // Ensure the item ID is a number
        const id = Number(itemId);
  
        // Call the deleteAssetItem function
        const isDeleted = await DynamoDBService.deleteAssetItem('CustomAssetItems', id, userEmail);
  
        if (isDeleted) {
          console.log('Item deleted successfully.');
          setAssetItems(prev => prev.filter(item => item.id !== id));
          alert('Item deleted successfully.');
        } else {
          console.error('Failed to delete item.');
        }
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
                <h5 className="mb-0">Total Value: ${totalValue.toFixed(2)}</h5>
              </Card.Header>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Value Analysis</h5>
              </Card.Header>
              <Card.Body>
                <CustomAssetVisualization 
                  assetItems={assetItems}
                  assetFields={asset.fields}
                  assetName={asset.name}
                />
              </Card.Body>
              <ResponsiveTable 
                data={assetItems}
                onDelete={handleDeleteItem}
                fields={asset.fields}
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