import React, { useState, useRef } from 'react';
import Layout from '../pages/AdLayout';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { Card, Form, Button, Table, Dropdown } from 'react-bootstrap';

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
    setCarDetails({ ...carDetails, [name]: value });
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
      setCarList(prevList => [...prevList, newCar]);
      setAutoTotal(prevTotal => prevTotal + carValue);

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
      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving car details:', error);
      setSaveButtonText('Save');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await deleteDoc(doc(db, 'autos', carId));
        const deletedCar = carList.find(car => car.id === carId);
        setCarList(prevList => prevList.filter(car => car.id !== carId));
        setAutoTotal(prevTotal => prevTotal - parseFloat(deletedCar.value));
        alert('Car deleted successfully.');
      } catch (error) {
        console.error('Error deleting car:', error);
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
        setCarDetails({
          make: firstRow.make || '',
          mileage: firstRow.mileage || '',
          year: firstRow.year || '',
          value: firstRow.value || '',
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
    const ws = XLSX.utils.json_to_sheet(carList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CarList");
    XLSX.writeFile(wb, "car_data.xlsx");
  };

  const chartData = carList.map(car => ({
    purchaseDate: car.purchaseDate,
    value: parseFloat(car.value)
  })).sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));

  return (
      <Layout>
      <div className="container mt-4">
        <Card className="mb-4">
          <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
            Enter Car Details
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
                <Form.Control
                  type="text"
                  name="make"
                  placeholder="Make"
                  value={carDetails.make}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="mileage"
                  placeholder="Mileage"
                  value={carDetails.mileage}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="year"
                  placeholder="Year of Build"
                  value={carDetails.year}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  name="value"
                  placeholder="Value"
                  value={carDetails.value}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Select
                  name="currency"
                  value={carDetails.currency}
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
                  value={carDetails.purchaseDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="text"
                  name="reminderNote"
                  placeholder="Reminder Note"
                  value={carDetails.reminderNote}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Control
                  type="date"
                  name="reminderDate"
                  value={carDetails.reminderDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleSaveCarDetails}>
                {saveButtonText}
              </Button>
            </Form>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header as="h5">Saved Car Details</Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Mileage</th>
                  <th>Year</th>
                  <th>Value</th>
                  <th>Currency</th>
                  <th>Purchase Date</th>
                  <th>Reminder Note</th>
                  <th>Reminder Date</th>
                  <th>User</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {carList.map(car => (
                  <tr key={car.id}>
                    <td>{car.make}</td>
                    <td>{car.mileage}</td>
                    <td>{car.year}</td>
                    <td>{car.value}</td>
                    <td>{car.currency}</td>
                    <td>{car.purchaseDate}</td>
                    <td>{car.reminderNote}</td>
                    <td>{car.reminderDate}</td>
                    <td>{car.userEmail}</td>
                    <td>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteCar(car.id)}>
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
          <Card.Header as="h5">Total Value of Autos: {autoTotal}</Card.Header>
        </Card>

        <Card className="mb-4">
          <Card.Header as="h5">Car Value Over Time</Card.Header>
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

export default Auto;