import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, Palette } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import FirestoreAssetService from '../firestoreAssetService';
import AssetScopeSelect from '../components/AssetScopeSelect';
import { useAssetScope } from '../utils/useAssetScope';
import '../style/AssetPages.css';

function ArtCollectibles({ userEmail, artCollectiblesList, setArtCollectiblesList, artCollectiblesTotal, fetchArtCollectiblesDetails, assetFilter = 'all', scopeFilterBanner }) {
  const [scope, setScope] = useAssetScope(assetFilter);
  const [artDetails, setArtDetails] = useState({
    title: '',
    artist: '',
    type: '',
    year: '',
    medium: '',
    dimensions: '',
    condition: '',
    purchaseDate: '',
    purchasePrice: '',
    estimatedValue: '',
    location: '',
    provenance: '',
    notes: '',
    currency: 'USD',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const artTypes = ['Painting', 'Sculpture', 'Photography', 'Print', 'Drawing', 'Ceramic', 'Textile', 'Furniture', 'Antique', 'Memorabilia', 'Other'];
  const conditions = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor', 'Restored'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArtDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveArtDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newArt = {
        ...artDetails,
        userEmail,
        scope,
        id: Date.now()
      };

      const savedArt = await FirestoreAssetService.addAsset('ArtCollectibles', newArt);
      setArtCollectiblesList(prev => [...prev, savedArt]);

      setArtDetails({
        title: '',
        artist: '',
        type: '',
        year: '',
        medium: '',
        dimensions: '',
        condition: '',
        purchaseDate: '',
        purchasePrice: '',
        estimatedValue: '',
        location: '',
        provenance: '',
        notes: '',
        currency: 'USD',
        reminderDate: ''
      });

      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving art details:', error);
      setSaveButtonText('Save');
      alert('Failed to save art details.');
    }
  };

  const handleDeleteArt = async (artId) => {
    if (window.confirm('Are you sure you want to delete this art entry?')) {
      try {
        await FirestoreAssetService.deleteAsset('ArtCollectibles', artId, userEmail);
        setArtCollectiblesList(prev => prev.filter(art => art.id !== artId));
        alert('Art entry deleted successfully.');
        fetchArtCollectiblesDetails(userEmail);
      } catch (error) {
        console.error('Error deleting art entry:', error);
        alert('Failed to delete art entry.');
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
        setArtDetails({
          title: data[0].title || '',
          artist: data[0].artist || '',
          type: data[0].type || '',
          year: data[0].year || '',
          medium: data[0].medium || '',
          dimensions: data[0].dimensions || '',
          condition: data[0].condition || '',
          purchaseDate: data[0].purchaseDate || '',
          purchasePrice: data[0].purchasePrice || '',
          estimatedValue: data[0].estimatedValue || '',
          location: data[0].location || '',
          provenance: data[0].provenance || '',
          notes: data[0].notes || '',
          currency: data[0].currency || 'USD',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(artCollectiblesList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ArtCollectiblesList");
    XLSX.writeFile(wb, "art_collectibles_data.xlsx");
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

    if (key === 'type') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Type</option>
          {artTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'condition') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Condition</option>
          {conditions.map(condition => (
            <option key={condition} value={condition}>{condition}</option>
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

    if (key === 'notes' || key === 'provenance') {
      return (
        <Form.Control
          as="textarea"
          rows={2}
          name={key}
          placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={key === 'purchasePrice' || key === 'estimatedValue' || key === 'year' ? 'number' : 'text'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
        onChange={handleInputChange}
      />
    );
  };

  return (
    <Layout>
      <div className="container-fluid vk-asset-page">
        <div className="create-asset-header" style={{ marginBottom: '1.5rem' }}>
          <Palette size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Art & Collectibles</h1>
          <p>Track paintings, sculptures, antiques, memorabilia and collectibles</p>
        </div>
        {scopeFilterBanner}

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Art / Collectible Details</h5>
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
                  {Object.entries(artDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveArtDetails} 
                      className="w-100"
                    >
                      {saveButtonText}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>

          {/* Table Column */}
          <div className="col-12 col-xl-8">
             <Card className="mb-4 total-value-card">
               <Card.Header>
                 <h5 className="mb-0">Total Art & Collectibles Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <Palette size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${artCollectiblesTotal.toFixed(2)}</div>
                   </div>
                 </div>
               </Card.Body>
             </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Your Collection</h5>
              </Card.Header>
              <Card.Body>
                <ResponsiveTable 
                  data={artCollectiblesList}
                  onDelete={handleDeleteArt}
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

export default ArtCollectibles;