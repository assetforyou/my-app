import React, { useState, useRef } from 'react';
import Layout from '../components/AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Dropdown } from 'react-bootstrap';
import ResponsiveTable from '../components/ResponsiveTable';
import AutoDepreciation from '../components/AutoDepreciation';

function Auto({ userEmail, carList, setCarList, autoTotal, setAutoTotal }) {
  const [carDetails, setCarDetails] = useState({
    make: '',
    mileage: '',
    year: '',
    value: '',
    currency: 'USD',
    purchaseDate: '',
    reminderNote: '',
    reminderDate: ''
  });
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const [selectedCarIds, setSelectedCarIds] = useState([]);

  const handleCarSelection = (selectedIds) => {
    setSelectedCarIds(selectedIds);
  };

  const handleSaveCarDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const carValue = parseFloat(carDetails.value);
      const newCarRef = await addDoc(collection(db, 'autos'), {
        ...carDetails,
        userEmail,
        value: carValue,
      });

      const newCar = {
        id: newCarRef.id,
        ...carDetails,
        userEmail,
        value: carValue,
      };
      setCarList(prev => [...prev, newCar]);
      setAutoTotal(prev => prev + carValue);

      setCarDetails({
        make: '',
        mileage: '',
        year: '',
        value: '',
        currency: 'USD',
        purchaseDate: '',
        reminderNote: '',
        reminderDate: ''
      });
      setSaveButtonText('Saved!');
      setTimeout(() => setSaveButtonText('Save'), 2000);
    } catch (error) {
      console.error('Error saving car details:', error);
      setSaveButtonText('Save');
      alert('Failed to save car details.');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteDoc(doc(db, 'autos', carId));
        const deletedCar = carList.find(car => car.id === carId);
        setCarList(prev => prev.filter(car => car.id !== carId));
        setAutoTotal(prev => prev - parseFloat(deletedCar.value));
        alert('Car deleted successfully.');
      } catch (error) {
        console.error('Error deleting car:', error);
        alert('Failed to delete car.');
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
        setCarDetails({
          make: data[0].make || '',
          mileage: data[0].mileage || '',
          year: data[0].year || '',
          value: data[0].value || '',
          currency: data[0].currency || 'USD',
          purchaseDate: data[0].purchaseDate || '',
          reminderNote: data[0].reminderNote || '',
          reminderDate: data[0].reminderDate || ''
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadData = () => {
    const ws = XLSX.utils.json_to_sheet(carList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CarList");
    XLSX.writeFile(wb, "car_data.xlsx");
  };

  const chartData = carList
    .map(car => ({
      purchaseDate: car.purchaseDate,
      value: parseFloat(car.value)
    }))
    .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

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
        type={key === 'value' ? 'number' : 'text'}
        name={key}
        placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        value={value}
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
                <h5 className="mb-0">Enter Car Details</h5>
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
                  {Object.entries(carDetails).map(([key, value]) => (
                    <div className="col-12" key={key}>
                      {renderFormControl(key, value)}
                    </div>
                  ))}
                  <div className="col-12">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveCarDetails} 
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
                <h5 className="mb-0">Total Value: {autoTotal}</h5>
              </Card.Header>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Auto Depreciation Analysis</h5>
              </Card.Header>
              <Card.Body>
                <AutoDepreciation 
                  carList={carList} 
                  selectedCarIds={selectedCarIds}
                />
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <ResponsiveTable 
                data={carList}
                onDelete={handleDeleteCar}
                onSelectionChange={handleCarSelection}
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

export default Auto;