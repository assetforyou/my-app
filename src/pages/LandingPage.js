import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import './LandingPage.css';

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('home');
  const [userEmail, setUserEmail] = useState('');
  const [carDetails, setCarDetails] = useState({ make: '', mileage: '', year: '' });
  const [carList, setCarList] = useState([]);
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [cashDetails, setCashDetails] = useState({ amount: '', currency: 'USD' });
  const [cashList, setCashList] = useState([]);
  const [cashTotal, setCashTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || 'User');
        fetchCarDetails();
        fetchCashDetails();
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

  const handleInputChange = (e, isCash = false) => {
    const { name, value } = e.target;
    if (isCash) {
      setCashDetails({ ...cashDetails, [name]: value });
    } else {
      setCarDetails({ ...carDetails, [name]: value });
    }
  };

  const handleSaveCarDetails = async () => {
    setSaveButtonText('Saving...');
    try {
      await addDoc(collection(db, 'autos'), {
        ...carDetails,
        userEmail,
      });
      setCarDetails({ make: '', mileage: '', year: '' });
      setSaveButtonText('Saved!');
      fetchCarDetails();

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

        // Create or update a document to store the cash details and total
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


  const fetchCarDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'autos'));
      const cars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarList(cars);
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
            <button onClick={handleSaveCarDetails}>{saveButtonText}</button>

            <h2>Saved Car Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Mileage</th>
                  <th>Year</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {carList.map(car => (
                  <tr key={car.id}>
                    <td>{car.make}</td>
                    <td>{car.mileage}</td>
                    <td>{car.year}</td>
                    <td>{car.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <button onClick={() => setSelectedAsset('digital')}>Digital</button>
            <button onClick={() => setSelectedAsset('stocks')}>Stocks</button>
            <button onClick={() => setSelectedAsset('metals')}>Metals</button>
          </div>
        </div>
        <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        <button className="back-to-website-btn" onClick={handleBackToWebsite}>Back to Website</button>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default LandingPage;



