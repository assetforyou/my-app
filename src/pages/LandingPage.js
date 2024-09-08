import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Auto from './Auto';
import Cash from './Cash';
import Stocks from './Stocks';
import Metals from './Metals';
import Property from './Property';
import './LandingPage.css';

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('home');
  const [userEmail, setUserEmail] = useState('');
  const [carList, setCarList] = useState([]);
  const [autoTotal, setAutoTotal] = useState(0);
  const [cashList, setCashList] = useState([]);
  const [cashTotal, setCashTotal] = useState(0);
  const [stockList, setStockList] = useState([]);
  const [stockTotal, setStockTotal] = useState(0);
  const [metalList, setMetalList] = useState([]);
  const [metalTotal, setMetalTotal] = useState(0);
  const [propertyList, setPropertyList] = useState([]);
  const [propertyTotalPrice, setPropertyTotalPrice] = useState(0);
  const [propertyTotalMonthlyCost, setPropertyTotalMonthlyCost] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || 'User');
        fetchCarDetails();
        fetchCashDetails();
        fetchStockDetails();
        fetchMetalDetails();
        fetchPropertyDetails();
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

  const fetchCarDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'autos'));
      const cars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarList(cars);
      const total = cars.reduce((sum, car) => sum + parseFloat(car.value || 0), 0);
      setAutoTotal(total);
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

  const fetchPropertyDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'properties'));
      const properties = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPropertyList(properties);
      const totalPrice = properties.reduce((sum, property) => sum + parseFloat(property.price || 0), 0);
      const totalMonthlyCost = properties.reduce((sum, property) => sum + parseFloat(property.totalMonthlyCost || 0), 0);
      setPropertyTotalPrice(totalPrice);
      setPropertyTotalMonthlyCost(totalMonthlyCost);
    } catch (error) {
      console.error('Error fetching property details:', error);
    }
  };

  const renderContent = () => {
    switch (selectedAsset) {
      case 'auto':
        return <Auto userEmail={userEmail} carList={carList} autoTotal={autoTotal} fetchCarDetails={fetchCarDetails} />;
      case 'cash':
        return <Cash userEmail={userEmail} cashList={cashList} cashTotal={cashTotal} fetchCashDetails={fetchCashDetails} />;
      case 'stocks':
        return <Stocks userEmail={userEmail} stockList={stockList} stockTotal={stockTotal} fetchStockDetails={fetchStockDetails} />;
      case 'metals':
        return <Metals userEmail={userEmail} metalList={metalList} metalTotal={metalTotal} fetchMetalDetails={fetchMetalDetails} />;
      case 'property':
        return <Property userEmail={userEmail} propertyList={propertyList} propertyTotalPrice={propertyTotalPrice} propertyTotalMonthlyCost={propertyTotalMonthlyCost} fetchPropertyDetails={fetchPropertyDetails} />;
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
            <div className="summary-box">
              <h3>Properties</h3>
              <p>Total Properties: {propertyList.length}</p> 
              <p>Total Property Value: {propertyTotalPrice}</p>
              <p>Total Monthly Cost: {propertyTotalMonthlyCost}</p>
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
            <button onClick={() => setSelectedAsset('property')}>Property</button>
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