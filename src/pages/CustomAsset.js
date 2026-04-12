import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import CustomAssetVisualization from '../components/CustomAssetVisualization';
import FirestoreAssetService from '../firestoreAssetService';
import { useToast } from '../components/Toast';
import '../style/AssetPages.css';

function CustomAsset({ userEmail, asset, fetchCustomAssets, updateAssetTotal }) {
  const [assetItems, setAssetItems] = useState([]);
  const [newItem, setNewItem] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [saveButtonText, setSaveButtonText] = useState('Add Item');
  const fileInputRef = useRef(null);
  const { success, error: showError, warning } = useToast();

  useEffect(() => {
    if (asset) {
      fetchAssetItems();
    }
  }, [asset.id]); // Re-fetch items when asset.id changes
  
  const fetchAssetItems = async () => {
    try {
      const items = await FirestoreAssetService.fetchAssetItems('CustomAssetItems', asset.id);
  
      setAssetItems(items);
      calculateTotalValue(items);
    } catch (error) {
      console.error('Error fetching custom asset items:', error);
    }
  };
  
  const handleAddItem = async () => {
    setSaveButtonText('Adding...');
    
    // Basic validation - check if required fields are filled
    const requiredFields = asset.fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!newItem[field.name] || newItem[field.name].toString().trim() === '') {
        showError(`Please fill in the required field: ${field.name}`);
        setSaveButtonText('Add Item');
        return;
      }
    }
    
    try {
      const newItemWithId = {
        ...newItem,
        userEmail,
        assetId: asset.id, // Link to the asset definition
        id: Date.now().toString(), // Generate a unique ID for the item
        createdAt: new Date().toISOString()
      };

      // Save the item to the CustomAssetItems table
      const savedItem = await FirestoreAssetService.addAssetItem('CustomAssetItems', newItemWithId);
      setAssetItems(prev => [...prev, savedItem]);
      setNewItem({});
      success('Item added successfully!');
      setSaveButtonText('Added!');
      setTimeout(() => setSaveButtonText('Add Item'), 2000);
    } catch (err) {
      console.error('Error adding custom asset item:', err);
      showError('Failed to add item. Please try again.');
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
        const isDeleted = await FirestoreAssetService.deleteAssetItem('CustomAssetItems', itemId, userEmail);

        if (isDeleted) {
          setAssetItems((prev) => prev.filter((item) => String(item.id) !== String(itemId)));
          success('Item deleted successfully.');
        } else {
          console.error('Failed to delete item.');
          showError('Failed to delete item. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting custom asset item:', err);
        showError('Failed to delete item. Please try again.');
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
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
          success('Data loaded from file successfully');
        } else {
          warning('No data found in the uploaded file');
        }
      } catch (err) {
        console.error('Error reading file:', err);
        showError('Failed to read the uploaded file. Please check the file format.');
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
      <div className="container-fluid vk-asset-page">
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
             <Card className="mb-4 total-value-card">
               <Card.Header>
                 <h5 className="mb-0">Total Asset Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <Layers size={32} style={{ opacity: 0.9 }} />
                   <div>
                     <div className="amount">${totalValue.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
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