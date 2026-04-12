import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/AdLayout';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Settings, X, Search } from 'lucide-react';
import { useToast } from '../components/Toast';
import Auto from './Auto';
import Cash from './Cash';
import Stocks from './Stocks';
import Metals from './Metals';
import Property from './Property';
import Loan from './Loan';
import Crypto from './Crypto';
import CreateAsset from './CreateAsset';
import CustomAsset from './CustomAsset';
import AccountSettings from '../components/AccountSettings';
import DashboardOverview from '../components/DashboardOverview';
import '../style/LandingPage.css';
import logo_transparent from '../images/logo_transparent.png';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import FirestoreAssetService from '../firestoreAssetService';

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
  const [cryptoList, setCryptoList] = useState([]);
  const [cryptoTotal, setCryptoTotal] = useState(0);
  const [customAssets, setCustomAssets] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();
  const { success, error: showError, warning } = useToast();

  // Toggle settings dropdown
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Toggle search - dispatch event to GlobalSearch component
  const toggleSearch = () => {
    window.dispatchEvent(new CustomEvent('vaultknight-toggle-search'));
  };

  // Handle account settings navigation
  const handleAccountSettings = () => {
    setSelectedAsset('accountSettings');
    setIsSettingsOpen(false);
  };

  // Handle sign out
  const handleSignOut = () => {
    setIsSettingsOpen(false);
    auth.signOut().then(() => {
      success('Signed out successfully');
      navigate('/login');
    }).catch((err) => {
      console.error('Sign out error:', err);
      showError('Failed to sign out. Please try again.');
    });
  };

  // Handle back to website navigation
  const handleBackToWebsite = () => {
    setIsSettingsOpen(false);
    navigate('/');
  };

  // Set selected asset and close settings
  const setSelectedAssetAndCloseSettings = (asset) => {
    setSelectedAsset(asset);
    setIsSettingsOpen(false);
  };

  // Handle search selection
  const handleSearchSelect = (item) => {
    setIsSearchOpen(false);
    if (item.action) {
      setSelectedAsset(item.action);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || 'User');
        fetchAllAssetDetails(user.email);
      }
    });

    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    // Listen for navigation events from GlobalSearch and KeyboardShortcuts
    const handleNavigationEvent = (event) => {
      const { action } = event.detail;
      if (action) {
        setSelectedAsset(action);
      }
    };

    // Listen for search toggle event
    const handleSearchToggle = () => {
      setIsSearchOpen(true);
    };

    window.addEventListener('vaultknight-navigate', handleNavigationEvent);
    window.addEventListener('vaultknight-toggle-search', handleSearchToggle);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('vaultknight-navigate', handleNavigationEvent);
      window.removeEventListener('vaultknight-toggle-search', handleSearchToggle);
    };
  }, []);

  const fetchAllAssetDetails = async (email) => {
    try {
      await Promise.all([
        fetchCarDetails(email),
        fetchCashDetails(email),
        fetchStockDetails(email),
        fetchMetalDetails(email),
        fetchPropertyDetails(email),
        fetchLoanDetails(email),
        fetchCryptoDetails(email),
        fetchCustomAssets(email),
      ]);
    } catch (err) {
      console.error('Error fetching asset details:', err);
      showError('Failed to fetch asset details. Please try again.');
    }
  };

  const fetchCarDetails = async (email) => {
    try {
      const cars = await FirestoreAssetService.fetchAssets('Autos', email);
      setCarList(cars);
      const total = cars.reduce((sum, car) => sum + parseFloat(car.value || 0), 0);
      setAutoTotal(total);
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const fetchCashDetails = async (email) => {
    try {
      const cashEntries = await FirestoreAssetService.fetchAssets('Cash', email);
      setCashList(cashEntries);
      const total = cashEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
      setCashTotal(total);
    } catch (error) {
      console.error('Error fetching cash details:', error);
    }
  };

  const fetchStockDetails = async (email) => {
    try {
      const stocks = await FirestoreAssetService.fetchAssets('Stocks', email);
      setStockList(stocks);
      const total = stocks.reduce((sum, stock) => sum + parseFloat(stock.total), 0);
      setStockTotal(total);
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  const fetchMetalDetails = async (email) => {
    try {
      const metals = await FirestoreAssetService.fetchAssets('Metals', email);
      setMetalList(metals);
      const total = metals.reduce((sum, metal) => sum + parseFloat(metal.total), 0);
      setMetalTotal(total);
    } catch (error) {
      console.error('Error fetching metal details:', error);
    }
  };

  const fetchPropertyDetails = async (email) => {
    try {
      const properties = await FirestoreAssetService.fetchAssets('Properties', email);
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
      const loans = await FirestoreAssetService.fetchAssets('Loans', email);
      setLoanList(loans);
      const total = loans.reduce((sum, loan) => sum + parseFloat(loan.loanValue || 0), 0);
      setLoanTotal(total);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    }
  };

  const fetchCryptoDetails = async (email) => {
    try {
      const cryptos = await FirestoreAssetService.fetchAssets('Crypto', email);
      setCryptoList(cryptos);
      const total = cryptos.reduce((sum, crypto) => sum + parseFloat(crypto.total || 0), 0);
      setCryptoTotal(total);
    } catch (error) {
      console.error('Error fetching crypto details:', error);
    }
  };

  const fetchCustomAssets = async (email) => {
    try {
      const assets = await FirestoreAssetService.fetchAssets('CustomAssets', email);
      setCustomAssets(assets);
    } catch (error) {
      console.error('Error fetching custom assets:', error);
    }
  };

  const updateAssetTotal = async (assetId, newTotal) => {
    try {
      await FirestoreAssetService.updateAsset('CustomAssets', assetId, { totalValue: newTotal });
      setCustomAssets(prevAssets =>
        prevAssets.map((asset) =>
          String(asset.id) === String(assetId) ? { ...asset, totalValue: newTotal } : asset
        )
      );
    } catch (err) {
      console.error('Error updating asset total:', err);
      showError('Failed to update asset total. Please try again.');
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        const id = assetId;

        const isDeleted = await FirestoreAssetService.deleteAsset('CustomAssets', id, userEmail);

        if (isDeleted) {
          console.log('Asset deleted successfully.');
          setCustomAssets(prevAssets =>
            prevAssets.filter((asset) => String(asset.id) !== String(id))
          );
          success('Asset has been deleted.');
        } else {
          console.error('Failed to delete asset.');
          showError('Failed to delete asset. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting asset:', err);
        showError('Failed to delete asset. Please try again.');
      }
    }
  };

  const renderContent = () => {
    switch (selectedAsset) {
      case 'accountSettings':
        return <AccountSettings userEmail={userEmail} />;
      case 'auto':
        return (
          <Auto
            userEmail={userEmail}
            carList={carList}
            setCarList={setCarList}
            autoTotal={autoTotal}
            setAutoTotal={setAutoTotal}
            fetchCarDetails={fetchCarDetails}
          />
        );
      case 'cash':
        return (
          <Cash
            userEmail={userEmail}
            cashList={cashList}
            setCashList={setCashList}
            cashTotal={cashTotal}
            setCashTotal={setCashTotal}
            fetchCashDetails={fetchCashDetails}
          />
        );
      case 'stocks':
        return (
          <Stocks
            userEmail={userEmail}
            stockList={stockList}
            setStockList={setStockList}
            stockTotal={stockTotal}
            setStockTotal={setStockTotal}
            fetchStockDetails={fetchStockDetails}
          />
        );
      case 'metals':
        return (
          <Metals
            userEmail={userEmail}
            metalList={metalList}
            setMetalList={setMetalList}
            metalTotal={metalTotal}
            setMetalTotal={setMetalTotal}
            fetchMetalDetails={fetchMetalDetails}
          />
        );
      case 'property':
        return (
          <Property
            userEmail={userEmail}
            propertyList={propertyList}
            setPropertyList={setPropertyList}
            propertyTotalPrice={propertyTotalPrice}
            setPropertyTotalPrice={setPropertyTotalPrice}
            propertyTotalMonthlyCost={propertyTotalMonthlyCost}
            setPropertyTotalMonthlyCost={setPropertyTotalMonthlyCost}
            fetchPropertyDetails={fetchPropertyDetails}
          />
        );
      case 'loan':
        return (
          <Loan
            userEmail={userEmail}
            loanList={loanList}
            setLoanList={setLoanList}
            loanTotal={loanTotal}
            setLoanTotal={setLoanTotal}
            fetchLoanDetails={fetchLoanDetails}
          />
        );
      case 'crypto':
        return (
          <Crypto
            userEmail={userEmail}
            cryptoList={cryptoList}
            setCryptoList={setCryptoList}
            cryptoTotal={cryptoTotal}
            setCryptoTotal={setCryptoTotal}
            fetchCryptoDetails={fetchCryptoDetails}
          />
        );
      case 'createAsset':
        return <CreateAsset userEmail={userEmail} onAssetCreated={fetchCustomAssets} />;
      case 'analytics':
        return (
          <AnalyticsDashboard
            cashList={cashList}
            stockList={stockList}
            metalList={metalList}
            propertyList={propertyList}
            cryptoList={cryptoList}
            cashTotal={cashTotal}
            stockTotal={stockTotal}
            metalTotal={metalTotal}
            propertyTotalPrice={propertyTotalPrice}
            cryptoTotal={cryptoTotal}
            userEmail={userEmail}
            customAssets={customAssets}
          />
        );
      case 'dashboard':
        return (
          <Layout>
            <DashboardOverview
              cashTotal={cashTotal}
              stockTotal={stockTotal}
              metalTotal={metalTotal}
              propertyTotalPrice={propertyTotalPrice}
              cryptoTotal={cryptoTotal}
              loanTotal={loanTotal}
              customAssets={customAssets}
              userEmail={userEmail}
            />
          </Layout>
        );
      case 'home':
        return (
          <Layout>
            <div className="home-content">
              <h2 className="summary-title">Asset Summary</h2>
              <div className="summary-container">
                <div className="summary-section">
                  <h2>Built-in Assets</h2>
                  <div className="built-in-assets">
                    <div className="summary-box" onClick={() => setSelectedAsset('cash')}>
                      <h3>Cash</h3>
                      <p>Total Cash: ${cashTotal.toFixed(2)}</p>
                    </div>
                    <div className="summary-box" onClick={() => setSelectedAsset('stocks')}>
                      <h3>Stocks</h3>
                      <p>Total Value: ${stockTotal.toFixed(2)}</p>
                    </div>
                    <div className="summary-box" onClick={() => setSelectedAsset('metals')}>
                      <h3>Metals</h3>
                      <p>Total Value: ${metalTotal.toFixed(2)}</p>
                    </div>
                    <div className="summary-box" onClick={() => setSelectedAsset('auto')}>
                      <h3>Autos</h3>
                      <p>Total: {carList.length}</p>
                      <p>Value: ${autoTotal.toFixed(2)}</p>
                    </div>
                    <div className="summary-box" onClick={() => setSelectedAsset('property')}>
                      <h3>Properties</h3>
                      <p>Total: {propertyList.length}</p>
                      <p>Value: ${propertyTotalPrice.toFixed(2)}</p>
                      <p>Monthly Cost: ${propertyTotalMonthlyCost.toFixed(2)}</p>
                    </div>
                    <div className="summary-box" onClick={() => setSelectedAsset('loan')}>
                      <h3>Loans</h3>
                      <p>Total: {loanList.length}</p>
                      <p>Value: ${loanTotal.toFixed(2)}</p>
                    </div>
                    <div className="summary-box" onClick={() => setSelectedAsset('crypto')}>
                      <h3>Cryptocurrency</h3>
                      <p>Total: {cryptoList.length}</p>
                      <p>Value: ${cryptoTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                {customAssets.length > 0 && (
                  <div className="summary-section">
                    <h2>Custom Assets</h2>
                    <div className="custom-assets">
                      {customAssets.map(asset => (
                        <div 
                          key={asset.id} 
                          className="custom-asset-card"
                          onClick={() => setSelectedAsset(`custom-${asset.id}`)} // Navigate to the custom asset's page
                        >
                          <div className="custom-asset-delete-icon" onClick={(e) => {
                            e.stopPropagation(); // Prevent the card click event from firing
                            handleDeleteAsset(asset.id);
                          }}>
                            <X size={20} />
                          </div>
                          <h3>{asset.name}</h3>
                          <p>Total Value: ${parseFloat(asset.totalValue || 0).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="advanced-analysis">
                <button type="button" className="vk-advanced-analysis" onClick={() => setSelectedAsset('analytics')}>
                  Advanced analysis
                </button>
              </div>
            </div>
          </Layout>
        );
      default:
        if (selectedAsset.startsWith('custom-')) {
          const assetId = selectedAsset.split('-')[1];
          const asset = customAssets.find((a) => String(a.id) === String(assetId));

          if (asset) {
            return (
              <CustomAsset
                userEmail={userEmail}
                asset={asset}
                fetchCustomAssets={fetchCustomAssets}
                updateAssetTotal={updateAssetTotal}
              />
            );
          }
          return <div className="asset-form-container"><div className="asset-form-card">Asset not found.</div></div>;
        }
        return <div>Select an asset type from the sidebar</div>;
    }
  };

  return (
    <div className="landing-page">
      <div className="top-bar">
        <div className="title">
          <img src={logo_transparent} alt="Vault Knight" className="custom-title-icon" />
          Vault Knight
        </div>
        <div className="settings-dropdown" ref={settingsRef}>
          {/* Search Icon - vertical, to the left of settings */}
          <button 
            onClick={toggleSearch} 
            className="search-icon-btn"
            aria-label="Open search"
            title="Search (Ctrl+K)"
          >
            <Search size={20} />
          </button>
          
          {/* Settings Icon */}
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
                <button onClick={() => setSelectedAsset('crypto')}>Crypto</button>
                {customAssets.map(asset => (
                  <button 
                    key={asset.id} 
                    onClick={() => setSelectedAsset(`custom-${asset.id}`)} // Set selectedAsset to custom-<assetId>
                  >
                    {asset.name}
                  </button>
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