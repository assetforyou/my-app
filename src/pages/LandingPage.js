import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import './LandingPage.css';

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('home');
  const [userEmail, setUserEmail] = useState('');
  const [carDetails, setCarDetails] = useState({ make: '', mileage: '', year: '', value: '', currency: 'USD' });
  const [carList, setCarList] = useState([]);
  const [autoTotal, setAutoTotal] = useState(0);
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [cashDetails, setCashDetails] = useState({ amount: '', currency: 'USD' });
  const [cashList, setCashList] = useState([]);
  const [cashTotal, setCashTotal] = useState(0);
  const [stockDetails, setStockDetails] = useState({ name: '', number: '', value: '', currency: 'USD' });
  const [stockList, setStockList] = useState([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [metalDetails, setMetalDetails] = useState({ type: '', grams: '', valuePerGram: '', currency: 'USD' });
  const [metalList, setMetalList] = useState([]);
  const [metalTotal, setMetalTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || 'User');
        fetchCarDetails();
        fetchCashDetails();
        fetchStockDetails();
        fetchMetalDetails();
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigate('/login');
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const handleInputChange = (e, isCash = false, isStock = false, isMetal = false) => {
    const { name, value } = e.target;
    if (isCash) {
      setCashDetails({ ...cashDetails, [name]: value });
    } else if (isStock) {
      setStockDetails({ ...stockDetails, [name]: value });
    } else if (isMetal) {
      setMetalDetails({ ...metalDetails, [name]: value });
    } else {
      setCarDetails({ ...carDetails, [name]: value });
    }
  };

  const handleSaveCarDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const carValue = parseFloat(carDetails.value);
      const newTotal = autoTotal + carValue;

      await addDoc(collection(db, 'autos'), {
        ...carDetails,
        userEmail,
        value: carValue, // Ensure value is stored as a number
      });

      // Update local state and fetch the latest details
      setAutoTotal(newTotal);
      setCarDetails({ make: '', mileage: '', year: '', value: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchCarDetails(); // Fetch the latest car details including the total

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving car details:', error);
      setSaveButtonText('Save');
      alert('Failed to save car details.');
    }
  };

  const handleSaveCashDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const amountInSelectedCurrency = parseFloat(cashDetails.amount);
      const newTotal = cashTotal + amountInSelectedCurrency;

      await addDoc(collection(db, 'cash'), {
        amount: amountInSelectedCurrency,
        currency: cashDetails.currency,
        total: newTotal,
        userEmail,
      });

      setCashTotal(newTotal);
      setCashDetails({ amount: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchCashDetails();

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving cash details:', error);
      setSaveButtonText('Save');
      alert('Failed to save cash details.');
    }
  };

  const handleSaveStockDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const numberOfStocks = parseFloat(stockDetails.number);
      const valuePerStock = parseFloat(stockDetails.value);
      const totalValue = numberOfStocks * valuePerStock;

      await addDoc(collection(db, 'stocks'), {
        name: stockDetails.name,
        number: numberOfStocks,
        value: valuePerStock,
        total: totalValue,
        currency: stockDetails.currency,
        userEmail,
      });

      setStockTotal(stockTotal + totalValue);
      setStockDetails({ name: '', number: '', value: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchStockDetails();

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving stock details:', error);
      setSaveButtonText('Save');
      alert('Failed to save stock details.');
    }
  };

  const handleSaveMetalDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      const grams = parseFloat(metalDetails.grams);
      const valuePerGram = parseFloat(metalDetails.valuePerGram);
      const totalValue = grams * valuePerGram;

      await addDoc(collection(db, 'metals'), {
        type: metalDetails.type,
        grams,
        valuePerGram,
        total: totalValue,
        currency: metalDetails.currency,
        userEmail,
      });

      setMetalTotal(metalTotal + totalValue);
      setMetalDetails({ type: '', grams: '', valuePerGram: '', currency: 'USD' });
      setSaveButtonText('Saved!');
      fetchMetalDetails();

      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving metal details:', error);
      setSaveButtonText('Save');
      alert('Failed to save metal details.');
    }
  };

  const fetchCarDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'autos'));
      const cars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarList(cars);

      // Calculate the total value of all cars
      const total = cars.reduce((sum, car) => sum + parseFloat(car.value || 0), 0);
      setAutoTotal(total); // Update the state with the new total
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const fetchCashDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cash'));
      const cashEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCashList(cashEntries);
      const total = cashEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
      setCashTotal(total);
    } catch (error) {
      console.error('Error fetching cash details:', error);
    }
  };

  const fetchStockDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'stocks'));
      const stocks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStockList(stocks);
      const total = stocks.reduce((sum, stock) => sum + parseFloat(stock.total), 0);
      setStockTotal(total);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  const fetchMetalDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'metals'));
      const metals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMetalList(metals);
      const total = metals.reduce((sum, metal) => sum + parseFloat(metal.total), 0);
      setMetalTotal(total);
    } catch (error) {
      console.error('Error fetching metal details:', error);
    }
  };

  const renderContent = () => {
    switch (selectedAsset) {
      case 'auto':
        return (
          <div className="auto-asset-form">
            <h2>Enter Car Details</h2>
            <input
              type="text"
              name="make"
              placeholder="Make"
              value={carDetails.make}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="mileage"
              placeholder="Mileage"
              value={carDetails.mileage}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="year"
              placeholder="Year of Build"
              value={carDetails.year}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="value"
              placeholder="Value"
              value={carDetails.value}
              onChange={handleInputChange}
            />
            <select
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
              {/* Add more currency options as needed */}
            </select>
            <button onClick={handleSaveCarDetails}>{saveButtonText}</button>

            <h2>Saved Car Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Mileage</th>
                  <th>Year</th>
                  <th>Value</th>
                  <th>Currency</th>
                  <th>User</th>
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
                    <td>{car.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Total Value of Autos: {autoTotal}</h2>
          </div>
        );
      case 'cash':
        return (
          <div className="auto-asset-form">
            <h2>Enter Cash Details</h2>
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={cashDetails.amount}
              onChange={(e) => handleInputChange(e, true)}
            />
            <select
              name="currency"
              value={cashDetails.currency}
              onChange={(e) => handleInputChange(e, true)}
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
              {/* Add more currencies as needed */}
            </select>
            <button onClick={handleSaveCashDetails}>{saveButtonText}</button>

            <h2>Saved Cash Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {cashList.map(cash => (
                  <tr key={cash.id}>
                    <td>{cash.amount}</td>
                    <td>{cash.currency}</td>
                    <td>{cash.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Total in Selected Currency: {cashTotal}</h2>
          </div>
        );
      case 'stocks':
        return (
          <div className="auto-asset-form">
            <h2>Enter Stock Details</h2>
            <input
              type="text"
              name="name"
              placeholder="Stock Name"
              value={stockDetails.name}
              onChange={(e) => handleInputChange(e, false, true)}
            />
            <input
              type="number"
              name="number"
              placeholder="Number of Stocks"
              value={stockDetails.number}
              onChange={(e) => handleInputChange(e, false, true)}
            />
            <input
              type="number"
              name="value"
              placeholder="Value per Stock"
              value={stockDetails.value}
              onChange={(e) => handleInputChange(e, false, true)}
            />
            <select
              name="currency"
              value={stockDetails.currency}
              onChange={(e) => handleInputChange(e, false, true)}
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
              {/* Add more currencies as needed */}
            </select>
            <button onClick={handleSaveStockDetails}>{saveButtonText}</button>

            <h2>Saved Stock Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Stock Name</th>
                  <th>Number of Stocks</th>
                  <th>Value per Stock</th>
                  <th>Total Value</th>
                  <th>Currency</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {stockList.map(stock => (
                  <tr key={stock.id}>
                    <td>{stock.name}</td>
                    <td>{stock.number}</td>
                    <td>{stock.value}</td>
                    <td>{stock.total}</td>
                    <td>{stock.currency}</td>
                    <td>{stock.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Total Value of Stocks: {stockTotal}</h2>
          </div>
        );
      case 'metals':
        return (
          <div className="auto-asset-form">
            <h2>Enter Metal Details</h2>
            <input
              type="text"
              name="type"
              placeholder="Type of Metal"
              value={metalDetails.type}
              onChange={(e) => handleInputChange(e, false, false, true)}
            />
            <input
              type="number"
              name="grams"
              placeholder="Grams"
              value={metalDetails.grams}
              onChange={(e) => handleInputChange(e, false, false, true)}
            />
            <input
              type="number"
              name="valuePerGram"
              placeholder="Value per Gram"
              value={metalDetails.valuePerGram}
              onChange={(e) => handleInputChange(e, false, false, true)}
            />
            <select
              name="currency"
              value={metalDetails.currency}
              onChange={(e) => handleInputChange(e, false, false, true)}
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
              {/* Add more currencies as needed */}
            </select>
            <button onClick={handleSaveMetalDetails}>{saveButtonText}</button>

            <h2>Saved Metal Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Type of Metal</th>
                  <th>Grams</th>
                  <th>Value per Gram</th>
                  <th>Total Value</th>
                  <th>Currency</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {metalList.map(metal => (
                  <tr key={metal.id}>
                    <td>{metal.type}</td>
                    <td>{metal.grams}</td>
                    <td>{metal.valuePerGram}</td>
                    <td>{metal.total}</td>
                    <td>{metal.currency}</td>
                    <td>{metal.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Total Value of Metals: {metalTotal}</h2>
          </div>
        );
      case 'home':
        return (
          <div className="summary-container">
            <div className="summary-box">
              <h3>Cash</h3>
              <p>Total Cash: {cashTotal}</p>
            </div>
            <div className="summary-box">
              <h3>Stocks</h3>
              <p>Total Value of Stocks: {stockTotal}</p>
            </div>
            <div className="summary-box">
              <h3>Metals</h3>
              <p>Total Value of Metals: {metalTotal}</p>
            </div>
            <div className="summary-box">
              <h3>Autos</h3>
              <p>Total Autos: {carList.length}</p>
              <p>Total Value of Autos: {autoTotal}</p>
            </div>
          </div>
        );
      default:
        return <div>Select an asset type from the sidebar</div>;
    }
  };

  return (
    <div className="landing-page">
      <div className="top-bar">
        <div className="title">Noble Asset Vault</div>
        <div className="user-email">{userEmail}</div>
      </div>
      <div className="sidebar">
        <button onClick={() => setSelectedAsset('home')}>Home</button>
        <div className="dropdown">
          <button className="dropbtn">Assets</button>
          <div className="dropdown-content">
            <button onClick={() => setSelectedAsset('auto')}>Auto</button>
            <button onClick={() => setSelectedAsset('cash')}>Cash</button>
            <button onClick={() => setSelectedAsset('stocks')}>Stocks</button>
            <button onClick={() => setSelectedAsset('metals')}>Metals</button>
          </div>
        </div>
        <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        <button className="back-to-website-btn" onClick={handleBackToWebsite}>Back to Website</button>
      </div>
      <div className="content">
        {selectedAsset === 'home' && (
          <div className="home-summary">
            <h2 className="summary-heading">Asset Summary</h2>
            {renderContent()}
          </div>
        )}
        {selectedAsset !== 'home' && renderContent()}
      </div>
    </div>
  );
}

export default LandingPage;
