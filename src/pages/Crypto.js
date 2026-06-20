import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import axios from 'axios';
import { Upload, Download, MoreVertical, Coins } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import CryptoProjection from '../components/CryptoProjection';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from '../components/AssetScopeSelect';
import { useAssetScope } from '../utils/useAssetScope';
import '../style/AssetPages.css';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

function Crypto({ userEmail, cryptoList, setCryptoList, cryptoTotal, setCryptoTotal, fetchCryptoDetails, assetFilter = 'all', scopeFilterBanner }) {
  const [scope, setScope] = useAssetScope(assetFilter);
  const [cryptoDetails, setCryptoDetails] = useState({
    name: '',
    symbol: '',
    number: '',
    value: '',
    currency: 'USD',
    purchaseDate: '',
    platform: '',
    walletAddress: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [selectedCryptoIds, setSelectedCryptoIds] = useState([]);
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCryptoDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSearchCrypto = async () => {
    try {
      const response = await axios.get(
        `${COINGECKO_API_BASE}/search?query=${searchQuery}`
      );
      setSearchResults(response.data.coins || []);
    } catch (error) {
      console.error('Error searching cryptocurrencies:', error);
    }
  };

  const fetchLiveCryptoPrice = async (symbol) => {
    try {
      const response = await axios.get(
        `${COINGECKO_API_BASE}/simple/price?ids=${symbol}&vs_currencies=usd`
      );
      return response.data[symbol].usd;
    } catch (error) {
      console.error('Error fetching crypto price:', error);
      return null;
    }
  };

  const handleSaveCryptoDetails = async () => {
    setSaveButtonText('Saving...');
    const livePrice = await fetchLiveCryptoPrice(cryptoDetails.symbol);
    if (livePrice) {
      const numberOfCoins = parseFloat(cryptoDetails.number);
      const totalValue = numberOfCoins * livePrice;

      const newCrypto = {
        ...cryptoDetails,
        userEmail,
        scope,
        value: livePrice,
        total: totalValue,
        id: Date.now() // Generate a unique ID as a number
      };

      try {
        const savedCrypto = await FirestoreAssetService.addAsset('Crypto', newCrypto);
        setCryptoList(prev => [...prev, savedCrypto]);
        setCryptoTotal(prev => prev + totalValue);

        setCryptoDetails({
          name: '',
          symbol: '',
          number: '',
          value: '',
          currency: 'USD',
          purchaseDate: '',
          platform: '',
          walletAddress: '',
          reminderNote: '',
          reminderDate: ''
        });

        setSaveButtonText('Saved!');
        setTimeout(() => setSaveButtonText('Save'), 2000);
      } catch (error) {
        console.error('Error saving crypto details:', error);
        setSaveButtonText('Save');
        alert('Failed to save crypto details.');
      }
    } else {
      setSaveButtonText('Save');
      alert('Failed to fetch live crypto price.');
    }
  };

  const handleDeleteCrypto = async (cryptoId) => {
  if (window.confirm('Are you sure you want to delete this crypto entry?')) {
    try {
      await FirestoreAssetService.deleteAsset('Crypto', cryptoId, userEmail); // Pass userEmail
      setCryptoList(prev => prev.filter(crypto => crypto.id !== cryptoId));
      alert('Crypto entry deleted successfully.');
      fetchCryptoDetails(userEmail);
    } catch (error) {
      console.error('Error deleting crypto entry:', error);
      alert('Failed to delete crypto entry.');
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
        setCryptoDetails({
          name: data[0].name || '',
          symbol: data[0].symbol || '',
          number: data[0].number || '',
          value: data[0].value || '',
          currency: data[0].currency || 'USD',
          purchaseDate: data[0].purchaseDate || '',
          platform: data[0].platform || '',
          walletAddress: data[0].walletAddress || '',
          reminderNote: data[0].reminderNote || '',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(cryptoList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CryptoList");
    XLSX.writeFile(wb, "crypto_data.xlsx");
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

    if (key === 'platform') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Platform</option>
          <option value="Binance">Binance</option>
          <option value="Coinbase">Coinbase</option>
          <option value="Kraken">Kraken</option>
          <option value="Gemini">Gemini</option>
          <option value="Hardware Wallet">Hardware Wallet</option>
          <option value="Other">Other</option>
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
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header" style={{ marginBottom: '1.5rem' }}>
          <Coins size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Cryptocurrency Assets</h1>
          <p>Track your digital currency holdings and investments</p>
        </div>
        {scopeFilterBanner}

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Cryptocurrency Details</h5>
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
                  {/* Crypto Search */}
                  <div className="col-12">
                    <Form.Control
                      type="text"
                      placeholder="Search Cryptocurrency"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button 
                      variant="secondary" 
                      onClick={handleSearchCrypto}
                      className="mt-2 w-100"
                    >
                      Search
                    </Button>
                    {searchResults.length > 0 && (
                      <div className="mt-2 border rounded p-2">
                        {searchResults.map((result) => (
                          <div 
                            key={result.id}
                            className="cursor-pointer p-1 hover:bg-gray-100"
                            onClick={() => {
                              setCryptoDetails(prev => ({
                                ...prev,
                                name: result.name,
                                symbol: result.id
                              }));
                              setSearchResults([]);
                              setSearchQuery('');
                            }}
                          >
                            {result.name} ({result.symbol.toUpperCase()})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {Object.entries(cryptoDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveCryptoDetails} 
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
                 <h5 className="mb-0">Total Crypto Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <Coins size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${cryptoTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Cryptocurrency Value Analysis</h5>
              </Card.Header>
              <Card.Body>
                <CryptoProjection 
                  cryptoList={cryptoList} 
                  selectedCryptoIds={selectedCryptoIds}
                />
              </Card.Body>
              <ResponsiveTable 
                data={cryptoList}
                onDelete={handleDeleteCrypto}
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

export default Crypto;