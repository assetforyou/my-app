import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { Upload, Download, MoreVertical, Watch } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import FirestoreAssetService from '../firestoreAssetService';
import '../style/AssetPages.css';

function LuxuryWatches({ userEmail, luxuryWatchesList, setLuxuryWatchesList, luxuryWatchesTotal, fetchLuxuryWatchesDetails }) {
  const [watchDetails, setWatchDetails] = useState({
    brand: '',
    model: '',
    referenceNumber: '',
    serialNumber: '',
    year: '',
    condition: '',
    movementType: '',
    caseMaterial: '',
    braceletMaterial: '',
    boxIncluded: false,
    papersIncluded: false,
    purchaseDate: '',
    purchasePrice: '',
    marketValue: '',
    serviceDate: '',
    nextServiceDate: '',
    notes: '',
    currency: 'USD',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const watchBrands = ['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'Cartier', 'IWC', 'Jaeger-LeCoultre', 'Vacheron Constantin', 'Breitling', 'TAG Heuer', 'Other'];
  const conditions = ['New', 'Unworn', 'Excellent', 'Good', 'Fair', 'Poor', 'Serviced'];
  const movementTypes = ['Automatic', 'Manual', 'Quartz', 'Solar', 'Kinetic'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setWatchDetails(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSaveWatchDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const newWatch = {
        ...watchDetails,
        userEmail,
        id: Date.now()
      };

      const savedWatch = await FirestoreAssetService.addAsset('LuxuryWatches', newWatch);
      setLuxuryWatchesList(prev => [...prev, savedWatch]);

      setWatchDetails({
        brand: '',
        model: '',
        referenceNumber: '',
        serialNumber: '',
        year: '',
        condition: '',
        movementType: '',
        caseMaterial: '',
        braceletMaterial: '',
        boxIncluded: false,
        papersIncluded: false,
        purchaseDate: '',
        purchasePrice: '',
        marketValue: '',
        serviceDate: '',
        nextServiceDate: '',
        notes: '',
        currency: 'USD',
        reminderDate: ''
      });

      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving watch details:', error);
      setSaveButtonText('Save');
      alert('Failed to save watch details.');
    }
  };

  const handleDeleteWatch = async (watchId) => {
    if (window.confirm('Are you sure you want to delete this watch entry?')) {
      try {
        await FirestoreAssetService.deleteAsset('LuxuryWatches', watchId, userEmail);
        setLuxuryWatchesList(prev => prev.filter(watch => watch.id !== watchId));
        alert('Watch entry deleted successfully.');
        fetchLuxuryWatchesDetails(userEmail);
      } catch (error) {
        console.error('Error deleting watch entry:', error);
        alert('Failed to delete watch entry.');
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
        setWatchDetails({
          brand: data[0].brand || '',
          model: data[0].model || '',
          referenceNumber: data[0].referenceNumber || '',
          serialNumber: data[0].serialNumber || '',
          year: data[0].year || '',
          condition: data[0].condition || '',
          movementType: data[0].movementType || '',
          caseMaterial: data[0].caseMaterial || '',
          braceletMaterial: data[0].braceletMaterial || '',
          boxIncluded: data[0].boxIncluded || false,
          papersIncluded: data[0].papersIncluded || false,
          purchaseDate: data[0].purchaseDate || '',
          purchasePrice: data[0].purchasePrice || '',
          marketValue: data[0].marketValue || '',
          serviceDate: data[0].serviceDate || '',
          nextServiceDate: data[0].nextServiceDate || '',
          notes: data[0].notes || '',
          currency: data[0].currency || 'USD',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(luxuryWatchesList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LuxuryWatchesList");
    XLSX.writeFile(wb, "luxury_watches_data.xlsx");
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

    if (key === 'brand') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Brand</option>
          {watchBrands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
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

    if (key === 'movementType') {
      return (
        <Form.Select
          name={key}
          value={value}
          onChange={handleInputChange}
        >
          <option value="">Select Movement Type</option>
          {movementTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Form.Select>
      );
    }

    if (key === 'boxIncluded' || key === 'papersIncluded') {
      return (
        <Form.Check
          type="checkbox"
          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          name={key}
          checked={value}
          onChange={handleInputChange}
        />
      );
    }

    if (key === 'purchaseDate' || key === 'serviceDate' || key === 'nextServiceDate' || key === 'reminderDate') {
      return (
        <Form.Control
          type="text"
          onFocus={(e) => e.target.type = 'date'}
          onBlur={(e) => {
            if (!e.target.value) e.target.type = 'text';
          }}
          name={key}
          placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={value}
          onChange={handleInputChange}
        />
      );
    }

    return (
      <Form.Control
        type={key === 'purchasePrice' || key === 'marketValue' || key === 'year' ? 'number' : 'text'}
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
          <Watch size={32} style={{ color: 'var(--primary-500)', marginBottom: '0.5rem' }} />
          <h1>Watches & Luxury Goods</h1>
          <p>Track luxury watches, jewelry, handbags and high value accessories</p>
        </div>

        <div className="row g-4">
          {/* Form Column */}
          <div className="col-12 col-xl-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Enter Watch / Luxury Item Details</h5>
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
                  {Object.entries(watchDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveWatchDetails} 
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
                 <h5 className="mb-0">Total Watches & Luxury Goods Value</h5>
               </Card.Header>
               <Card.Body style={{ paddingTop: '0', paddingBottom: '1.5rem' }}>
                 <div className="d-flex align-items-center gap-3">
                   <Watch size={32} style={{ color: 'var(--primary-500)' }} />
                   <div>
                     <div className="amount">${luxuryWatchesTotal.toFixed(2)}</div>
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
                  data={luxuryWatchesList}
                  onDelete={handleDeleteWatch}
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

export default LuxuryWatches;