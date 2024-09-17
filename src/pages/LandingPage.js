import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Settings } from 'lucide-react';
import Auto from './Auto';
import Cash from './Cash';
import Stocks from './Stocks';
import Metals from './Metals';
import Property from './Property';
import Loan from './Loan';
import CreateAsset from './CreateAsset';
import CustomAsset from './CustomAsset';
import AccountSettings from './AccountSettings';
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
  const [loanList, setLoanList] = useState([]);
  const [loanTotal, setLoanTotal] = useState(0);
  const [customAssets, setCustomAssets] = useState([]);
  const [selectedAssetForAction, setSelectedAssetForAction] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || 'User');
        fetchCarDetails(user.email);
        fetchCashDetails(user.email);
        fetchStockDetails(user.email);
        fetchMetalDetails(user.email);
        fetchPropertyDetails(user.email);
        fetchLoanDetails(user.email);
        fetchCustomAssets(user.email);
      } else {
        navigate('/login');
      }
    });

    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleAccountSettings = () => {
    setSelectedAsset('accountSettings');
    setIsSettingsOpen(false);
  };

  const handleSignOut = () => {
    setIsSettingsOpen(false);
    auth.signOut().then(() => {
      navigate('/login');
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  const handleBackToWebsite = () => {
    setIsSettingsOpen(false);
    navigate('/');
  };

  const setSelectedAssetAndCloseSettings = (asset) => {
    setSelectedAsset(asset);
    setIsSettingsOpen(false);
  };

  const fetchCarDetails = async (email) => {
    try {
      const q = query(collection(db, 'autos'), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const cars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarList(cars);
      const total = cars.reduce((sum, car) => sum + parseFloat(car.value || 0), 0);
      setAutoTotal(total);
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const fetchCashDetails = async (email) => {
    try {
      const q = query(collection(db, 'cash'), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const cashEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCashList(cashEntries);
      const total = cashEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
      setCashTotal(total);
    } catch (error) {
      console.error('Error fetching cash details:', error);
    }
  };

  const fetchStockDetails = async (email) => {
    try {
      const q = query(collection(db, 'stocks'), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const stocks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStockList(stocks);
      const total = stocks.reduce((sum, stock) => sum + parseFloat(stock.total), 0);
      setStockTotal(total);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  const fetchMetalDetails = async (email) => {
    try {
      const q = query(collection(db, 'metals'), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const metals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMetalList(metals);
      const total = metals.reduce((sum, metal) => sum + parseFloat(metal.total), 0);
      setMetalTotal(total);
    } catch (error) {
      console.error('Error fetching metal details:', error);
    }
  };

  const fetchPropertyDetails = async (email) => {
    try {
      const q = query(collection(db, 'properties'), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
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

  const fetchLoanDetails = async (email) => {
    try {
      const q = query(collection(db, 'loans'), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const loans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoanList(loans);
      const total = loans.reduce((sum, loan) => sum + parseFloat(loan.loanValue || 0), 0);
      setLoanTotal(total);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    }
  };

  const fetchCustomAssets = async (email) => {
    try {
      const q = query(collection(db, 'customAssets'), where("userEmail", "==", email));
      const querySnapshot = await getDocs(q);
      const assets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomAssets(assets);
    } catch (error) {
      console.error('Error fetching custom assets:', error);
    }
  };

  const updateAssetTotal = async (assetId, newTotal) => {
    try {
      const assetRef = doc(db, 'customAssets', assetId);
      await updateDoc(assetRef, { totalValue: newTotal });
      
      setCustomAssets(prevAssets => 
        prevAssets.map(asset => 
          asset.id === assetId ? { ...asset, totalValue: newTotal } : asset
        )
      );
    } catch (error) {
      console.error('Error updating asset total:', error);
    }
  };

  const handleAssetClick = (asset) => {
    setSelectedAssetForAction(asset);
  };

  const handleAssetAction = async (action) => {
    if (action === 'view') {
      setSelectedAsset(`custom-${selectedAssetForAction.id}`);
    } else if (action === 'delete') {
      try {
        await deleteDoc(doc(db, 'customAssets', selectedAssetForAction.id));
        setCustomAssets(prevAssets => prevAssets.filter(asset => asset.id !== selectedAssetForAction.id));
        setSelectedAsset('home');
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Failed to delete asset.');
      }
    }
    setSelectedAssetForAction(null);
  };

  const renderContent = () => {
    if (selectedAssetForAction) {
      return (
        <div className="asset-action-container">
          <h3>What would you like to do with {selectedAssetForAction.name}?</h3>
          <div className="asset-action-buttons">
          <button onClick={() => handleAssetAction('view')}>View Asset Page</button>
          <button onClick={() => handleAssetAction('delete')}>Delete Asset</button>
          <button onClick={() => setSelectedAssetForAction(null)}>Cancel</button>
          </div>
        </div>
      );
    }

    switch (selectedAsset) {
      case 'accountSettings':
        return <AccountSettings userEmail={userEmail} />;
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
      case 'loan':
        return <Loan userEmail={userEmail} loanList={loanList} loanTotal={loanTotal} fetchLoanDetails={fetchLoanDetails} />;
      case 'createAsset':
        return <CreateAsset userEmail={userEmail} onAssetCreated={fetchCustomAssets} />;
      case 'home':
        return (
          <div className="home-content">
            <h2 className="summary-title">Asset Summary</h2>
            <div className="summary-container">
              <div className="summary-section">
                <h2>Built-in Assets</h2>
                <div className="built-in-assets">
                  <div className="summary-box">
                    <h3>Cash</h3>
                    <p>Total Cash: ${cashTotal.toFixed(2)}</p>
                  </div>
                  <div className="summary-box">
                    <h3>Stocks</h3>
                    <p>Total Value: ${stockTotal.toFixed(2)}</p>
                  </div>
                  <div className="summary-box">
                    <h3>Metals</h3>
                    <p>Total Value: ${metalTotal.toFixed(2)}</p>
                  </div>
                  <div className="summary-box">
                    <h3>Autos</h3>
                    <p>Total: {carList.length}</p>
                    <p>Value: ${autoTotal.toFixed(2)}</p>
                  </div>
                  <div className="summary-box">
                    <h3>Properties</h3>
                    <p>Total: {propertyList.length}</p>
                    <p>Value: ${propertyTotalPrice.toFixed(2)}</p>
                    <p>Monthly Cost: ${propertyTotalMonthlyCost.toFixed(2)}</p>
                  </div>
                  <div className="summary-box">
                    <h3>Loans</h3>
                    <p>Total: {loanList.length}</p>
                    <p>Value: ${loanTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              {customAssets.length > 0 && (
                <div className="summary-section">
                  <h2>Custom Assets</h2>
                  <div className="custom-assets">
                    {customAssets.map(asset => (
                      <div key={asset.id} className="summary-box clickable" onClick={() => handleAssetClick(asset)}>
                        <h3>{asset.name}</h3>
                        <p>Total Value: ${parseFloat(asset.totalValue || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        if (selectedAsset.startsWith('custom-')) {
          const assetId = selectedAsset.split('-')[1];
          const asset = customAssets.find(a => a.id === assetId);
          return asset ? (
            <CustomAsset 
              userEmail={userEmail} 
              asset={asset} 
              fetchCustomAssets={fetchCustomAssets}
              updateAssetTotal={updateAssetTotal}
            />
          ) : null;
        }
        return <div>Select an asset type from the sidebar</div>;
    }
  };

  return (
    <div className="landing-page">
      <div className="top-bar">
        <div className="title">Noble Asset Vault</div>
        <div className="settings-dropdown" ref={settingsRef}>
          <button onClick={toggleSettings} className="settings-icon">
            <Settings size={24} />
          </button>
          {isSettingsOpen && (
            <div className="settings-menu">
              <div className="user-email">{userEmail}</div>
              <button onClick={handleAccountSettings}>Account Settings</button>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-buttons">
            <button onClick={() => setSelectedAssetAndCloseSettings('home')}>Home</button>
            <button className="create-asset-btn" onClick={() => setSelectedAssetAndCloseSettings('createAsset')}>Create Asset</button>
            <div className="dropdown">
              <button className="dropbtn">Assets</button>
              <div className="dropdown-content">
                <button onClick={() => setSelectedAssetAndCloseSettings('auto')}>Auto</button>
                <button onClick={() => setSelectedAssetAndCloseSettings('cash')}>Cash</button>
                <button onClick={() => setSelectedAssetAndCloseSettings('stocks')}>Stocks</button>
                <button onClick={() => setSelectedAsset('metals')}>Metals</button>
                <button onClick={() => setSelectedAsset('property')}>Property</button>
                <button onClick={() => setSelectedAsset('loan')}>Loan</button>
                {customAssets.map(asset => (
                  <button key={asset.id} onClick={() => setSelectedAsset(`custom-${asset.id}`)}>{asset.name}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="sidebar-footer">
            <button className="back-to-website-btn" onClick={handleBackToWebsite}>Back to Website</button>
            <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default LandingPage;