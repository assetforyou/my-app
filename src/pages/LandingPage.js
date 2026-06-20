import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/AdLayout';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Settings, X, Search, LayoutDashboard, LayoutGrid, BarChart3, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useToast } from '../components/Toast';
import Auto from './Auto';
import Cash from './Cash';
import Stocks from './Stocks';
import Metals from './Metals';
import Property from './Property';
import Loan from './Loan';
import Crypto from './Crypto';
import Bonds from './Bonds';
import Retirement from './Retirement';
import Savings from './Savings';
import Commodities from './Commodities';
import ArtCollectibles from './ArtCollectibles';
import LuxuryWatches from './LuxuryWatches';
import PrivateEquity from './PrivateEquity';
import IntellectualProperty from './IntellectualProperty';
import CreateAsset from './CreateAsset';
import CustomAsset from './CustomAsset';
import AccountSettings from '../components/AccountSettings';
import DashboardOverview from '../components/DashboardOverview';
import '../style/LandingPage.css';
import logo_transparent from '../images/logo_transparent.png';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import FirestoreAssetService from '../firestoreAssetService';
import OnboardingModal from '../components/OnboardingModal';
import EmptyState, { PORTFOLIO_EMPTY_ACTIONS } from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { SIDEBAR_PRIMARY, SIDEBAR_ASSET_GROUPS } from '../data/sidebarConfig';
import { calculatePortfolioTotals, countTotalAssets, formatCurrency } from '../utils/portfolioUtils';
import '../style/EmptyState.css';

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('dashboard');
  const [assetFilter, setAssetFilter] = useState('all'); // 'all', 'personal', 'business'
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
  const [bondList, setBondList] = useState([]);
  const [bondTotal, setBondTotal] = useState(0);
  const [retirementList, setRetirementList] = useState([]);
  const [retirementTotal, setRetirementTotal] = useState(0);
  const [savingsList, setSavingsList] = useState([]);
  const [savingsTotal, setSavingsTotal] = useState(0);
  const [commoditiesList, setCommoditiesList] = useState([]);
  const [commoditiesTotal, setCommoditiesTotal] = useState(0);
  const [artCollectiblesList, setArtCollectiblesList] = useState([]);
  const [artCollectiblesTotal, setArtCollectiblesTotal] = useState(0);
  const [luxuryWatchesList, setLuxuryWatchesList] = useState([]);
  const [luxuryWatchesTotal, setLuxuryWatchesTotal] = useState(0);
  const [privateEquityList, setPrivateEquityList] = useState([]);
  const [privateEquityTotal, setPrivateEquityTotal] = useState(0);
  const [intellectualPropertyList, setIntellectualPropertyList] = useState([]);
  const [intellectualPropertyTotal, setIntellectualPropertyTotal] = useState(0);
  const [customAssets, setCustomAssets] = useState([]);
  const [isPortfolioLoading, setIsPortfolioLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
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
    setIsPortfolioLoading(true);
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
        fetchBondDetails(email),
        fetchRetirementDetails(email),
        fetchSavingsDetails(email),
        fetchCommoditiesDetails(email),
        fetchArtCollectiblesDetails(email),
        fetchLuxuryWatchesDetails(email),
        fetchPrivateEquityDetails(email),
        fetchIntellectualPropertyDetails(email),
      ]);
    } catch (err) {
      console.error('Error fetching asset details:', err);
      showError('Failed to fetch asset details. Please try again.');
    } finally {
      setIsPortfolioLoading(false);
    }
  };

  const portfolioLists = {
    carList, cashList, stockList, metalList, propertyList, loanList,
    cryptoList, bondList, retirementList, savingsList, commoditiesList,
    artCollectiblesList, luxuryWatchesList, privateEquityList,
    intellectualPropertyList, customAssets,
  };

  const totalAssetCount = countTotalAssets(portfolioLists);

  useEffect(() => {
    if (!isPortfolioLoading && userEmail && totalAssetCount === 0) {
      const completed = localStorage.getItem('vk_onboarding_complete');
      if (!completed) {
        setShowOnboarding(true);
      }
    }
  }, [isPortfolioLoading, userEmail, totalAssetCount]);

  useEffect(() => {
    SIDEBAR_ASSET_GROUPS.forEach((group) => {
      if (group.items.some((item) => item.id === selectedAsset)) {
        setExpandedGroups((prev) => ({ ...prev, [group.label]: true }));
      }
    });
    if (selectedAsset.startsWith('custom-')) {
      setExpandedGroups((prev) => ({ ...prev, Custom: true }));
    }
  }, [selectedAsset]);

  const PRIMARY_ICONS = {
    dashboard: LayoutDashboard,
    home: LayoutGrid,
    analytics: BarChart3,
  };

  const handleNavigate = (action) => setSelectedAsset(action);

  const handleOpenChat = () => {
    window.dispatchEvent(new CustomEvent('vaultknight-open-chatbot'));
  };

  const toggleSidebarGroup = (label) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
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

  const fetchBondDetails = async (email) => {
    try {
      const bonds = await FirestoreAssetService.fetchAssets('Bonds', email);
      setBondList(bonds);
      const total = bonds.reduce((sum, bond) => sum + parseFloat(bond.currentValue || 0), 0);
      setBondTotal(total);
    } catch (error) {
      console.error('Error fetching bond details:', error);
    }
  };

  const fetchRetirementDetails = async (email) => {
    try {
      const retirement = await FirestoreAssetService.fetchAssets('Retirement', email);
      setRetirementList(retirement);
      const total = retirement.reduce((sum, rt) => sum + parseFloat(rt.currentBalance || 0), 0);
      setRetirementTotal(total);
    } catch (error) {
      console.error('Error fetching retirement details:', error);
    }
  };

  const fetchSavingsDetails = async (email) => {
    try {
      const savings = await FirestoreAssetService.fetchAssets('Savings', email);
      setSavingsList(savings);
      const total = savings.reduce((sum, sv) => sum + parseFloat(sv.currentBalance || 0), 0);
      setSavingsTotal(total);
    } catch (error) {
      console.error('Error fetching savings details:', error);
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

  const fetchCommoditiesDetails = async (email) => {
    try {
      const commodities = await FirestoreAssetService.fetchAssets('Commodities', email);
      setCommoditiesList(commodities);
      const total = commodities.reduce((sum, item) => sum + parseFloat(item.currentValue || 0), 0);
      setCommoditiesTotal(total);
    } catch (error) {
      console.error('Error fetching commodities details:', error);
    }
  };

  const fetchArtCollectiblesDetails = async (email) => {
    try {
      const items = await FirestoreAssetService.fetchAssets('ArtCollectibles', email);
      setArtCollectiblesList(items);
      const total = items.reduce((sum, item) => sum + parseFloat(item.estimatedValue || 0), 0);
      setArtCollectiblesTotal(total);
    } catch (error) {
      console.error('Error fetching art collectibles details:', error);
    }
  };

  const fetchLuxuryWatchesDetails = async (email) => {
    try {
      const items = await FirestoreAssetService.fetchAssets('LuxuryWatches', email);
      setLuxuryWatchesList(items);
      const total = items.reduce((sum, item) => sum + parseFloat(item.marketValue || 0), 0);
      setLuxuryWatchesTotal(total);
    } catch (error) {
      console.error('Error fetching luxury watches details:', error);
    }
  };

  const fetchPrivateEquityDetails = async (email) => {
    try {
      const items = await FirestoreAssetService.fetchAssets('PrivateEquity', email);
      setPrivateEquityList(items);
      const total = items.reduce((sum, item) => sum + parseFloat(item.investmentValue || 0), 0);
      setPrivateEquityTotal(total);
    } catch (error) {
      console.error('Error fetching private equity details:', error);
    }
  };

  const fetchIntellectualPropertyDetails = async (email) => {
    try {
      const items = await FirestoreAssetService.fetchAssets('IntellectualProperty', email);
      setIntellectualPropertyList(items);
      const total = items.reduce((sum, item) => sum + parseFloat(item.royaltyValue || 0), 0);
      setIntellectualPropertyTotal(total);
    } catch (error) {
      console.error('Error fetching intellectual property details:', error);
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

  // Asset Type Categorization
  const personalAssetTypes = ['auto', 'cash', 'metals', 'crypto', 'artCollectibles', 'luxuryWatches'];
  const businessAssetTypes = ['stocks', 'bonds', 'retirement', 'savings', 'property', 'privateEquity', 'intellectualProperty', 'commodities'];
  
  // Filter assets based on selection
  const getFilteredAssets = (assetList, assetType) => {
    if (assetFilter === 'all') return assetList;
    if (assetFilter === 'personal' && personalAssetTypes.includes(assetType)) return assetList;
    if (assetFilter === 'business' && businessAssetTypes.includes(assetType)) return assetList;
    return [];
  };
  
  // Calculate filtered totals
  const filteredAutoTotal = getFilteredAssets(carList, 'auto').reduce((sum, item) => sum + parseFloat(item.value || 0), 0);
  const filteredCashTotal = getFilteredAssets(cashList, 'cash').reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const filteredStockTotal = getFilteredAssets(stockList, 'stocks').reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const filteredMetalTotal = getFilteredAssets(metalList, 'metals').reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const filteredPropertyTotal = getFilteredAssets(propertyList, 'property').reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
  const filteredCryptoTotal = getFilteredAssets(cryptoList, 'crypto').reduce((sum, item) => sum + parseFloat(item.total || 0), 0);
  const filteredBondTotal = getFilteredAssets(bondList, 'bonds').reduce((sum, item) => sum + parseFloat(item.currentValue || 0), 0);
  const filteredRetirementTotal = getFilteredAssets(retirementList, 'retirement').reduce((sum, item) => sum + parseFloat(item.currentBalance || 0), 0);
  const filteredSavingsTotal = getFilteredAssets(savingsList, 'savings').reduce((sum, item) => sum + parseFloat(item.currentBalance || 0), 0);

  const portfolioSummary = calculatePortfolioTotals({
    cashTotal: filteredCashTotal,
    stockTotal: filteredStockTotal,
    metalTotal: filteredMetalTotal,
    propertyTotalPrice: filteredPropertyTotal,
    cryptoTotal: filteredCryptoTotal,
    autoTotal: filteredAutoTotal,
    bondTotal: filteredBondTotal,
    retirementTotal: filteredRetirementTotal,
    savingsTotal: filteredSavingsTotal,
    commoditiesTotal: getFilteredAssets(commoditiesList, 'commodities').reduce((s, i) => s + parseFloat(i.currentValue || 0), 0),
    artCollectiblesTotal: getFilteredAssets(artCollectiblesList, 'artCollectibles').reduce((s, i) => s + parseFloat(i.estimatedValue || 0), 0),
    luxuryWatchesTotal: getFilteredAssets(luxuryWatchesList, 'luxuryWatches').reduce((s, i) => s + parseFloat(i.marketValue || 0), 0),
    privateEquityTotal: getFilteredAssets(privateEquityList, 'privateEquity').reduce((s, i) => s + parseFloat(i.investmentValue || 0), 0),
    intellectualPropertyTotal: getFilteredAssets(intellectualPropertyList, 'intellectualProperty').reduce((s, i) => s + parseFloat(i.royaltyValue || 0), 0),
    loanTotal,
    customAssets,
  });

  const emptyActions = PORTFOLIO_EMPTY_ACTIONS({
    onAddAsset: () => setSelectedAsset('cash'),
    onImport: () => setSelectedAsset('createAsset'),
    onChat: handleOpenChat,
  });

  // Visibility checks for asset cards
  const showPersonalAssets = assetFilter === 'all' || assetFilter === 'personal';
  const showBusinessAssets = assetFilter === 'all' || assetFilter === 'business';

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
      case 'bonds':
        return (
          <Bonds
            userEmail={userEmail}
            bondList={bondList}
            setBondList={setBondList}
            bondTotal={bondTotal}
            setBondTotal={setBondTotal}
            fetchBondDetails={fetchBondDetails}
          />
        );
      case 'retirement':
        return (
          <Retirement
            userEmail={userEmail}
            retirementList={retirementList}
            setRetirementList={setRetirementList}
            retirementTotal={retirementTotal}
            setRetirementTotal={setRetirementTotal}
            fetchRetirementDetails={fetchRetirementDetails}
          />
        );
      case 'savings':
        return (
          <Savings
            userEmail={userEmail}
            savingsList={savingsList}
            setSavingsList={setSavingsList}
            savingsTotal={savingsTotal}
            setSavingsTotal={setSavingsTotal}
            fetchSavingsDetails={fetchSavingsDetails}
          />
        );
      case 'commodities':
        return (
          <Commodities
            userEmail={userEmail}
            commodityList={commoditiesList}
            setCommodityList={setCommoditiesList}
            commodityTotal={commoditiesTotal}
            fetchCommoditiesDetails={fetchCommoditiesDetails}
          />
        );
      case 'artCollectibles':
        return (
          <ArtCollectibles
            userEmail={userEmail}
            artCollectiblesList={artCollectiblesList}
            setArtCollectiblesList={setArtCollectiblesList}
            artCollectiblesTotal={artCollectiblesTotal}
            fetchArtCollectiblesDetails={fetchArtCollectiblesDetails}
          />
        );
      case 'privateEquity':
        return (
          <PrivateEquity
            userEmail={userEmail}
            privateEquityList={privateEquityList}
            setPrivateEquityList={setPrivateEquityList}
            privateEquityTotal={privateEquityTotal}
            fetchPrivateEquityDetails={fetchPrivateEquityDetails}
          />
        );
      case 'intellectualProperty':
        return (
          <IntellectualProperty
            userEmail={userEmail}
            intellectualPropertyList={intellectualPropertyList}
            setIntellectualPropertyList={setIntellectualPropertyList}
            intellectualPropertyTotal={intellectualPropertyTotal}
            fetchIntellectualPropertyDetails={fetchIntellectualPropertyDetails}
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
        return isPortfolioLoading ? (
          <Layout><LoadingSkeleton type="metrics" /></Layout>
        ) : (
          <Layout>
            <DashboardOverview
              cashTotal={cashTotal}
              stockTotal={stockTotal}
              metalTotal={metalTotal}
              propertyTotalPrice={propertyTotalPrice}
              cryptoTotal={cryptoTotal}
              autoTotal={autoTotal}
              bondTotal={bondTotal}
              retirementTotal={retirementTotal}
              savingsTotal={savingsTotal}
              commoditiesTotal={commoditiesTotal}
              artCollectiblesTotal={artCollectiblesTotal}
              luxuryWatchesTotal={luxuryWatchesTotal}
              privateEquityTotal={privateEquityTotal}
              intellectualPropertyTotal={intellectualPropertyTotal}
              loanTotal={loanTotal}
              customAssets={customAssets}
              onNavigate={handleNavigate}
            />
          </Layout>
        );
      case 'home':
        if (isPortfolioLoading) {
          return <Layout><LoadingSkeleton type="card" count={6} /></Layout>;
        }
        if (totalAssetCount === 0) {
          return (
            <Layout>
              <EmptyState
                title="Your vault is empty"
                description="Start building your portfolio by adding assets manually, importing a spreadsheet, or chatting with the assistant."
                actions={emptyActions}
              />
            </Layout>
          );
        }
        return (
          <Layout>
            <div className="home-content">
              <div className="vk-net-worth-hero">
                <p className="vk-net-worth-hero__label">Net Worth</p>
                <p className="vk-net-worth-hero__value">{formatCurrency(portfolioSummary.netWorth)}</p>
                <p className="vk-net-worth-hero__sub">
                  {totalAssetCount} asset{totalAssetCount !== 1 ? 's' : ''} tracked
                </p>
              </div>
              <h2 className="summary-title">Asset Summary</h2>
              <div className="summary-container">
                <div className="summary-section">
                  <h2>Built-in Assets</h2>
                  <div className="built-in-assets">
                    {showPersonalAssets && (
                      <>
                        <div className="summary-box" onClick={() => setSelectedAsset('cash')}>
                          <h3>Cash</h3>
                          <p>Total Cash: ${filteredCashTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('metals')}>
                          <h3>Metals</h3>
                          <p>Total Value: ${filteredMetalTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('auto')}>
                          <h3>Autos</h3>
                          <p>Total: {getFilteredAssets(carList, 'auto').length}</p>
                          <p>Value: ${filteredAutoTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('crypto')}>
                          <h3>Cryptocurrency</h3>
                          <p>Total: {getFilteredAssets(cryptoList, 'crypto').length}</p>
                          <p>Value: ${filteredCryptoTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('artCollectibles')}>
                          <h3>Art & Collectibles</h3>
                          <p>Total: {getFilteredAssets(artCollectiblesList, 'artCollectibles').length}</p>
                          <p>Value: ${getFilteredAssets(artCollectiblesList, 'artCollectibles').reduce((sum, item) => sum + parseFloat(item.estimatedValue || 0), 0).toFixed(2)}</p>
                        </div>
                      </>
                    )}
                    
                    {showBusinessAssets && (
                      <>
                        <div className="summary-box" onClick={() => setSelectedAsset('stocks')}>
                          <h3>Stocks</h3>
                          <p>Total Value: ${filteredStockTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('commodities')}>
                          <h3>Commodities</h3>
                          <p>Total: {getFilteredAssets(commoditiesList, 'commodities').length}</p>
                          <p>Value: ${getFilteredAssets(commoditiesList, 'commodities').reduce((sum, item) => sum + parseFloat(item.currentValue || 0), 0).toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('property')}>
                          <h3>Properties</h3>
                          <p>Total: {getFilteredAssets(propertyList, 'property').length}</p>
                          <p>Value: ${filteredPropertyTotal.toFixed(2)}</p>
                          <p>Monthly Cost: ${propertyTotalMonthlyCost.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('bonds')}>
                          <h3>Bonds</h3>
                          <p>Total: {getFilteredAssets(bondList, 'bonds').length}</p>
                          <p>Value: ${filteredBondTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('retirement')}>
                          <h3>Retirement</h3>
                          <p>Total: {getFilteredAssets(retirementList, 'retirement').length}</p>
                          <p>Value: ${filteredRetirementTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('savings')}>
                          <h3>Savings</h3>
                          <p>Total: {getFilteredAssets(savingsList, 'savings').length}</p>
                          <p>Value: ${filteredSavingsTotal.toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('privateEquity')}>
                          <h3>Private Equity</h3>
                          <p>Total: {getFilteredAssets(privateEquityList, 'privateEquity').length}</p>
                          <p>Value: ${getFilteredAssets(privateEquityList, 'privateEquity').reduce((sum, item) => sum + parseFloat(item.investmentValue || 0), 0).toFixed(2)}</p>
                        </div>
                        <div className="summary-box" onClick={() => setSelectedAsset('intellectualProperty')}>
                          <h3>Intellectual Property</h3>
                          <p>Total: {getFilteredAssets(intellectualPropertyList, 'intellectualProperty').length}</p>
                          <p>Value: ${getFilteredAssets(intellectualPropertyList, 'intellectualProperty').reduce((sum, item) => sum + parseFloat(item.royaltyValue || 0), 0).toFixed(2)}</p>
                        </div>
                      </>
                    )}

                    <div className="summary-box" onClick={() => setSelectedAsset('loan')}>
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

         {/* Personal / Business Filter Dropdown */}
         <div className="asset-filter-dropdown">
           <select 
             className="asset-filter-select"
             value={assetFilter}
             onChange={(e) => setAssetFilter(e.target.value)}
           >
             <option value="all">🌐 All Assets</option>
             <option value="personal">👤 Personal</option>
             <option value="business">🏢 Business</option>
           </select>
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
            <button
              type="button"
              className="sidebar-cta"
              onClick={() => setSelectedAssetAndCloseSettings('createAsset')}
            >
              <Plus size={18} strokeWidth={2.5} />
              Create Asset
            </button>

            <nav className="sidebar-primary" aria-label="Main navigation">
              {SIDEBAR_PRIMARY.map((item) => {
                const Icon = PRIMARY_ICONS[item.id];
                const isActive = selectedAsset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`sidebar-primary-link${isActive ? ' is-active' : ''}`}
                    onClick={() => setSelectedAssetAndCloseSettings(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {Icon && <Icon size={18} strokeWidth={2} className="sidebar-primary-link__icon" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="sidebar-divider">
              <span className="sidebar-divider__label">Asset categories</span>
            </div>

            <div className="sidebar-asset-groups">
              {SIDEBAR_ASSET_GROUPS.map((group) => {
                const isOpen = !!expandedGroups[group.label];
                const hasActiveChild = group.items.some((item) => item.id === selectedAsset);
                return (
                  <div key={group.label} className={`sidebar-asset-group${isOpen ? ' is-open' : ''}${hasActiveChild ? ' has-active' : ''}`}>
                    <button
                      type="button"
                      className="sidebar-group-toggle"
                      onClick={() => toggleSidebarGroup(group.label)}
                      aria-expanded={isOpen}
                    >
                      <span className="sidebar-group-toggle__label">{group.label}</span>
                      {isOpen ? (
                        <ChevronDown size={16} className="sidebar-group-toggle__chevron" aria-hidden />
                      ) : (
                        <ChevronRight size={16} className="sidebar-group-toggle__chevron" aria-hidden />
                      )}
                    </button>
                    {isOpen && (
                      <div className="sidebar-group-items" role="group" aria-label={group.label}>
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`sidebar-nav-item${selectedAsset === item.id ? ' is-active' : ''}`}
                            onClick={() => setSelectedAssetAndCloseSettings(item.id)}
                            aria-current={selectedAsset === item.id ? 'page' : undefined}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {customAssets.length > 0 && (
                <div className={`sidebar-asset-group${expandedGroups.Custom ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="sidebar-group-toggle"
                    onClick={() => toggleSidebarGroup('Custom')}
                    aria-expanded={!!expandedGroups.Custom}
                  >
                    <span className="sidebar-group-toggle__label">Custom</span>
                    {expandedGroups.Custom ? (
                      <ChevronDown size={16} className="sidebar-group-toggle__chevron" aria-hidden />
                    ) : (
                      <ChevronRight size={16} className="sidebar-group-toggle__chevron" aria-hidden />
                    )}
                  </button>
                  {expandedGroups.Custom && (
                    <div className="sidebar-group-items" role="group" aria-label="Custom assets">
                      {customAssets.map((asset) => (
                        <button
                          key={asset.id}
                          type="button"
                          className={`sidebar-nav-item${selectedAsset === `custom-${asset.id}` ? ' is-active' : ''}`}
                          onClick={() => setSelectedAsset(`custom-${asset.id}`)}
                        >
                          {asset.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            setShowOnboarding(false);
            setSelectedAsset('dashboard');
          }}
          onAddAsset={() => {
            setShowOnboarding(false);
            setSelectedAsset('cash');
          }}
        />
      )}
    </div>
  );
}

export default LandingPage;