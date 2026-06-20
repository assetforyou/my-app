import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from '../components/AssetScopeSelect';
import { useAssetScope } from '../utils/useAssetScope';
import '../style/AssetPages.css';

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || '';

function Commodities({ userEmail, commodityList, setCommodityList, commodityTotal, fetchCommodityDetails, assetFilter = 'all', scopeFilterBanner }) {
  const [scope, setScope] = useAssetScope(assetFilter);
  const [commodityDetails, setCommodityDetails] = useState({
    type: '',
    quantity: '',
    unit: '',
    currency: 'USD',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    notes: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [availableCommodities, setAvailableCommodities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAvailableCommodities();
  }, []);

  const fetchCommodityPrice = async (symbol) => {
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Missing REACT_APP_ALPHA_VANTAGE_API_KEY in .env');
    }
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

  const fetchAvailableCommodities = async () => {
    setIsLoading(true);
    setError(null);
    
    const commodities = [
      { symbol: 'CL', name: 'Crude Oil', unit: 'Barrel' },
      { symbol: 'NG', name: 'Natural Gas', unit: 'MMBtu' },
      { symbol: 'ZW', name: 'Wheat', unit: 'Bushel' },
      { symbol: 'ZC', name: 'Corn', unit: 'Bushel' },
      { symbol: 'ZS', name: 'Soybeans', unit: 'Bushel' },
      { symbol: 'KC', name: 'Coffee', unit: 'Pound' },
      { symbol: 'CT', name: 'Cotton', unit: 'Pound' },
      { symbol: 'SB', name: 'Sugar', unit: 'Pound' },
      { symbol: 'GC', name: 'Gold', unit: 'Ounce' },
      { symbol: 'SI', name: 'Silver', unit: 'Ounce' }
    ];

    try {
      if (ALPHA_VANTAGE_API_KEY) {
        const fetchedCommodities = await Promise.all(
          commodities.map(async (commodity) => {
            try {
              const price = await fetchCommodityPrice(commodity.symbol);
              return { ...commodity, price };
            } catch (error) {
              return { ...commodity, price: null };
            }
          })
        );
        setAvailableCommodities(fetchedCommodities);
      } else {
        setAvailableCommodities(commodities.map(c => ({ ...c, price: null })));
        setError('Add REACT_APP_ALPHA_VANTAGE_API_KEY to your .env file to load live prices.');
      }
    } catch (error) {
      setError('Failed to fetch commodity prices. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommodityDetails(prev => ({ 
      ...prev, 
      [name]: value,
      currentValue: (name === 'quantity' || name === 'purchasePrice') 
        ? (parseFloat(value || 0) * parseFloat(prev.purchasePrice || prev.quantity || 0)) 
        : prev.currentValue
    }));
  };

  const handleCommoditySelection = (e) => {
    const selectedName = e.target.value;
    const selectedCommodity = availableCommodities.find(c => c.name === selectedName);
    if (selectedCommodity) {
      setCommodityDetails(prev => ({
        ...prev,
        type: selectedCommodity.name,
        unit: selectedCommodity.unit,
        purchasePrice: selectedCommodity.price || '',
        currentValue: prev.quantity ? prev.quantity * (selectedCommodity.price || 0) : 0
      }));
    }
  };

  const handleSaveCommodityDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newCommodity = {
        ...commodityDetails,
        userEmail,
        scope,
        id: Date.now()
      };

      const savedCommodity = await FirestoreAssetService.addAsset('Commodities', newCommodity);
      setCommodityList(prev => [...prev, savedCommodity]);

      setCommodityDetails({
        type: '',
        quantity: '',
        unit: '',
        currency: 'USD',
        purchaseDate: '',
        purchasePrice: '',
        currentValue: '',
        notes: '',
        reminderDate: ''
      });

      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving commodity details:', error);
      setSaveButtonText('Save');
      alert('Failed to save commodity details.');
    }
  };

  const handleDeleteCommodity = async (commodityId) => {
    if (window.confirm('Are you sure you want to delete this commodity entry?')) {
      try {
        await FirestoreAssetService.deleteAsset('Commodities', commodityId, userEmail);
        setCommodityList(prev => prev.filter(commodity => commodity.id !== commodityId));
        alert('Commodity entry deleted successfully.');
        fetchCommodityDetails(userEmail);
      } catch (error) {
        console.error('Error deleting commodity entry:', error);
        alert('Failed to delete commodity entry.');
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
        setCommodityDetails({
          type: data[0].type || '',
          quantity: data[0].quantity || '',
          unit: data[0].unit || '',
          currency: data[0].currency || 'USD',
          purchaseDate: data[0].purchaseDate || '',
          purchasePrice: data[0].purchasePrice || '',
          currentValue: data[0].currentValue || '',
          notes: data[0].notes || '',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(commodityList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CommodityList");
    XLSX.writeFile(wb, "commodity_data.xlsx");
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

    return (
      <Form.Control
        type={key === 'quantity' || key === 'purchasePrice' || key === 'currentValue' ? 'number' : 'text'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
        onChange={handleInputChange}
        readOnly={key === 'currentValue'}
      />
    );
  };

  return (
    <Layout>
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header" style={{ marginBottom: '1.5rem' }}>
          <BarChart3 size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Commodities</h1>
          <p>Track oil, natural gas, wheat, corn, agriculture and other commodities</p>
        </div>
        {scopeFilterBanner}

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Commodity Details</h5>
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
                    <AssetScopeSelect value={scope} onChange={setScope} />
                  </div>
                  <div className="col-12">
                    <Form.Select
                      value={commodityDetails.type}
                      onChange={handleCommoditySelection}
                    >
                      <option value="">Select a commodity</option>
                      {availableCommodities.map(commodity => (
                        <option key={commodity.symbol} value={commodity.name}>
                          {commodity.name}: {commodity.price ? `$${commodity.price.toFixed(2)} per ${commodity.unit}` : 'Price unavailable'}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  {Object.entries(commodityDetails).map(([key, value]) => (
                    key !== 'type' && (
                      <div className="col-12" key={key}>
                        {renderFormControl(key, value)}
                      </div>
                    )
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveCommodityDetails} 
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
                 <h5 className="mb-0">Total Commodities Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <BarChart3 size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${commodityTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Your Commodities</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveTable 
                  data={commodityList}
                  onDelete={handleDeleteCommodity}
                />
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

export default Commodities;