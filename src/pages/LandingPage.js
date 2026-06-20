import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/AdLayout';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Settings, X, Search, LayoutDashboard, LayoutGrid, BarChart3, ChevronDown, ChevronRight, Plus, Menu } from 'lucide-react';
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
import MobileNav from '../components/MobileNav';
import PortfolioLoading from '../components/PortfolioLoading';
import '../style/MobileNav.css';
import { SIDEBAR_PRIMARY, SIDEBAR_ASSET_GROUPS } from '../data/sidebarConfig';
import { calculatePortfolioTotals, countTotalAssets, formatCurrency } from '../utils/portfolioUtils';
import { filterByScope, scopeLabel, SCOPE_FILTER } from '../utils/assetScope';
import { buildPortfolioSearchItems } from '../utils/portfolioSearch';
import '../style/EmptyState.css';
import '../style/AssetScopeSelect.css';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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

  const handleNavigate = (action) => {
    setSelectedAsset(action);
    setMobileMenuOpen(false);
  };

  const setSelectedAssetAndCloseSettings = (asset) => {
    setSelectedAsset(asset);
    setIsSettingsOpen(false);
    setMobileMenuOpen(false);
  };

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

  // Per-record personal / business scope filtering
  const scopeList = (list, typeKey) => filterByScope(list, assetFilter, typeKey);

  const scopedCarList = scopeList(carList, 'auto');
  const scopedCashList = scopeList(cashList, 'cash');
  const scopedStockList = scopeList(stockList, 'stocks');
  const scopedMetalList = scopeList(metalList, 'metals');
  const scopedPropertyList = scopeList(propertyList, 'property');
  const scopedLoanList = scopeList(loanList, 'loan');
  const scopedCryptoList = scopeList(cryptoList, 'crypto');
  const scopedBondList = scopeList(bondList, 'bonds');
  const scopedRetirementList = scopeList(retirementList, 'retirement');
  const scopedSavingsList = scopeList(savingsList, 'savings');
  const scopedCommoditiesList = scopeList(commoditiesList, 'commodities');
  const scopedArtList = scopeList(artCollectiblesList, 'artCollectibles');
  const scopedWatchesList = scopeList(luxuryWatchesList, 'luxuryWatches');
  const scopedPEList = scopeList(privateEquityList, 'privateEquity');
  const scopedIPList = scopeList(intellectualPropertyList, 'intellectualProperty');
  const scopedCustomAssets = assetFilter === SCOPE_FILTER.ALL
    ? customAssets
    : customAssets.filter((a) => filterByScope([a], assetFilter, null).length > 0);

  const sumField = (list, field) => list.reduce((s, item) => s + parseFloat(item[field] || 0), 0);

  const filteredAutoTotal = sumField(scopedCarList, 'value');
  const filteredCashTotal = sumField(scopedCashList, 'amount');
  const filteredStockTotal = sumField(scopedStockList, 'total');
  const filteredMetalTotal = sumField(scopedMetalList, 'total');
  const filteredPropertyTotal = sumField(scopedPropertyList, 'price');
  const filteredCryptoTotal = sumField(scopedCryptoList, 'total');
  const filteredBondTotal = sumField(scopedBondList, 'currentValue');
  const filteredRetirementTotal = sumField(scopedRetirementList, 'currentBalance');
  const filteredSavingsTotal = sumField(scopedSavingsList, 'currentBalance');
  const filteredLoanTotal = sumField(scopedLoanList, 'loanValue');
  const filteredCommoditiesTotal = sumField(scopedCommoditiesList, 'currentValue');
  const filteredArtTotal = sumField(scopedArtList, 'estimatedValue');
  const filteredWatchesTotal = sumField(scopedWatchesList, 'marketValue');
  const filteredPETotal = sumField(scopedPEList, 'investmentValue');
  const filteredIPTotal = sumField(scopedIPList, 'royaltyValue');

  useEffect(() => {
    if (isPortfolioLoading) return;
    const items = buildPortfolioSearchItems({
      cashList, stockList, cryptoList, propertyList, carList, metalList,
      loanList, bondList, retirementList, savingsList, commoditiesList,
      artCollectiblesList, luxuryWatchesList, privateEquityList,
      intellectualPropertyList, customAssets,
    });
    window.dispatchEvent(new CustomEvent('vaultknight-portfolio-search', { detail: { items } }));
  }, [
    isPortfolioLoading, cashList, stockList, cryptoList, propertyList, carList,
    metalList, loanList, bondList, retirementList, savingsList, commoditiesList,
    artCollectiblesList, luxuryWatchesList, privateEquityList, intellectualPropertyList,
    customAssets,
  ]);

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
    commoditiesTotal: filteredCommoditiesTotal,
    artCollectiblesTotal: filteredArtTotal,
    luxuryWatchesTotal: filteredWatchesTotal,
    privateEquityTotal: filteredPETotal,
    intellectualPropertyTotal: filteredIPTotal,
    loanTotal: filteredLoanTotal,
    customAssets: scopedCustomAssets,
  });

  const scopedAssetCount = countTotalAssets({
    carList: scopedCarList, cashList: scopedCashList, stockList: scopedStockList,
    metalList: scopedMetalList, propertyList: scopedPropertyList, loanList: scopedLoanList,
    cryptoList: scopedCryptoList, bondList: scopedBondList, retirementList: scopedRetirementList,
    savingsList: scopedSavingsList, commoditiesList: scopedCommoditiesList,
    artCollectiblesList: scopedArtList, luxuryWatchesList: scopedWatchesList,
    privateEquityList: scopedPEList, intellectualPropertyList: scopedIPList,
    customAssets: scopedCustomAssets,
  });

  const scopeFilterBanner = assetFilter !== SCOPE_FILTER.ALL && (
    <p className="asset-scope-filter-hint">
      Showing <strong>{scopeLabel(assetFilter)}</strong> assets only — change via the filter in the top bar.
    </p>
  );

  const pageProps = { assetFilter, scopeFilterBanner };

  const emptyActions = PORTFOLIO_EMPTY_ACTIONS({
    onAddAsset: () => setSelectedAsset('cash'),
    onImport: () => setSelectedAsset('createAsset'),
    onChat: handleOpenChat,
  });

  const homeSummaryCards = [
    { id: 'cash', title: 'Cash', count: scopedCashList.length, value: filteredCashTotal },
    { id: 'stocks', title: 'Stocks', count: scopedStockList.length, value: filteredStockTotal },
    { id: 'crypto', title: 'Cryptocurrency', count: scopedCryptoList.length, value: filteredCryptoTotal },
    { id: 'property', title: 'Properties', count: scopedPropertyList.length, value: filteredPropertyTotal, extra: propertyTotalMonthlyCost > 0 ? `Monthly: $${propertyTotalMonthlyCost.toFixed(2)}` : null },
    { id: 'auto', title: 'Autos', count: scopedCarList.length, value: filteredAutoTotal },
    { id: 'metals', title: 'Metals', count: scopedMetalList.length, value: filteredMetalTotal },
    { id: 'bonds', title: 'Bonds', count: scopedBondList.length, value: filteredBondTotal },
    { id: 'retirement', title: 'Retirement', count: scopedRetirementList.length, value: filteredRetirementTotal },
    { id: 'savings', title: 'Savings', count: scopedSavingsList.length, value: filteredSavingsTotal },
    { id: 'commodities', title: 'Commodities', count: scopedCommoditiesList.length, value: filteredCommoditiesTotal },
    { id: 'artCollectibles', title: 'Art & Collectibles', count: scopedArtList.length, value: filteredArtTotal },
    { id: 'luxuryWatches', title: 'Luxury Watches', count: scopedWatchesList.length, value: filteredWatchesTotal },
    { id: 'privateEquity', title: 'Private Equity', count: scopedPEList.length, value: filteredPETotal },
    { id: 'intellectualProperty', title: 'Intellectual Property', count: scopedIPList.length, value: filteredIPTotal },
    { id: 'loan', title: 'Loans', count: scopedLoanList.length, value: filteredLoanTotal },
  ].filter((card) => assetFilter === SCOPE_FILTER.ALL || card.count > 0);

  const renderContent = () => {
    if (isPortfolioLoading && selectedAsset !== 'accountSettings') {
      const skeletonType = selectedAsset === 'home' ? 'card' : selectedAsset === 'dashboard' ? 'metrics' : 'table';
      return (
        <Layout>
          <PortfolioLoading type={skeletonType} />
        </Layout>
      );
    }

    switch (selectedAsset) {
      case 'accountSettings':
        return <AccountSettings userEmail={userEmail} />;
      case 'auto':
        return (
          <Auto
            {...pageProps}
            userEmail={userEmail}
            carList={scopedCarList}
            setCarList={setCarList}
            autoTotal={filteredAutoTotal}
            setAutoTotal={setAutoTotal}
            fetchCarDetails={fetchCarDetails}
          />
        );
      case 'cash':
        return (
          <Cash
            {...pageProps}
            userEmail={userEmail}
            cashList={scopedCashList}
            setCashList={setCashList}
            cashTotal={filteredCashTotal}
            setCashTotal={setCashTotal}
            fetchCashDetails={fetchCashDetails}
          />
        );
      case 'stocks':
        return (
          <Stocks
            {...pageProps}
            userEmail={userEmail}
            stockList={scopedStockList}
            setStockList={setStockList}
            stockTotal={filteredStockTotal}
            setStockTotal={setStockTotal}
            fetchStockDetails={fetchStockDetails}
          />
        );
      case 'metals':
        return (
          <Metals
            {...pageProps}
            userEmail={userEmail}
            metalList={scopedMetalList}
            setMetalList={setMetalList}
            metalTotal={filteredMetalTotal}
            setMetalTotal={setMetalTotal}
            fetchMetalDetails={fetchMetalDetails}
          />
        );
      case 'property':
        return (
          <Property
            {...pageProps}
            userEmail={userEmail}
            propertyList={scopedPropertyList}
            setPropertyList={setPropertyList}
            propertyTotalPrice={filteredPropertyTotal}
            setPropertyTotalPrice={setPropertyTotalPrice}
            propertyTotalMonthlyCost={propertyTotalMonthlyCost}
            setPropertyTotalMonthlyCost={setPropertyTotalMonthlyCost}
            fetchPropertyDetails={fetchPropertyDetails}
          />
        );
      case 'loan':
        return (
          <Loan
            {...pageProps}
            userEmail={userEmail}
            loanList={scopedLoanList}
            setLoanList={setLoanList}
            loanTotal={filteredLoanTotal}
            setLoanTotal={setLoanTotal}
            fetchLoanDetails={fetchLoanDetails}
          />
        );
      case 'crypto':
        return (
          <Crypto
            {...pageProps}
            userEmail={userEmail}
            cryptoList={scopedCryptoList}
            setCryptoList={setCryptoList}
            cryptoTotal={filteredCryptoTotal}
            setCryptoTotal={setCryptoTotal}
            fetchCryptoDetails={fetchCryptoDetails}
          />
        );
      case 'bonds':
        return (
          <Bonds
            {...pageProps}
            userEmail={userEmail}
            bondList={scopedBondList}
            setBondList={setBondList}
            bondTotal={filteredBondTotal}
            setBondTotal={setBondTotal}
            fetchBondDetails={fetchBondDetails}
          />
        );
      case 'retirement':
        return (
          <Retirement
            {...pageProps}
            userEmail={userEmail}
            retirementList={scopedRetirementList}
            setRetirementList={setRetirementList}
            retirementTotal={filteredRetirementTotal}
            setRetirementTotal={setRetirementTotal}
            fetchRetirementDetails={fetchRetirementDetails}
          />
        );
      case 'savings':
        return (
          <Savings
            {...pageProps}
            userEmail={userEmail}
            savingsList={scopedSavingsList}
            setSavingsList={setSavingsList}
            savingsTotal={filteredSavingsTotal}
            setSavingsTotal={setSavingsTotal}
            fetchSavingsDetails={fetchSavingsDetails}
          />
        );
      case 'commodities':
        return (
          <Commodities
            {...pageProps}
            userEmail={userEmail}
            commodityList={scopedCommoditiesList}
            setCommodityList={setCommoditiesList}
            commodityTotal={filteredCommoditiesTotal}
            fetchCommoditiesDetails={fetchCommoditiesDetails}
          />
        );
      case 'artCollectibles':
        return (
          <ArtCollectibles
            {...pageProps}
            userEmail={userEmail}
            artCollectiblesList={scopedArtList}
            setArtCollectiblesList={setArtCollectiblesList}
            artCollectiblesTotal={filteredArtTotal}
            fetchArtCollectiblesDetails={fetchArtCollectiblesDetails}
          />
        );
      case 'privateEquity':
        return (
          <PrivateEquity
            {...pageProps}
            userEmail={userEmail}
            privateEquityList={scopedPEList}
            setPrivateEquityList={setPrivateEquityList}
            privateEquityTotal={filteredPETotal}
            fetchPrivateEquityDetails={fetchPrivateEquityDetails}
          />
        );
      case 'intellectualProperty':
        return (
          <IntellectualProperty
            {...pageProps}
            userEmail={userEmail}
            intellectualPropertyList={scopedIPList}
            setIntellectualPropertyList={setIntellectualPropertyList}
            intellectualPropertyTotal={filteredIPTotal}
            fetchIntellectualPropertyDetails={fetchIntellectualPropertyDetails}
          />
        );
      case 'createAsset':
        return <CreateAsset {...pageProps} userEmail={userEmail} onAssetCreated={fetchCustomAssets} />;
      case 'analytics':
        return (
          <AnalyticsDashboard
            {...pageProps}
            cashList={scopedCashList}
            stockList={scopedStockList}
            metalList={scopedMetalList}
            propertyList={scopedPropertyList}
            cryptoList={scopedCryptoList}
            cashTotal={filteredCashTotal}
            stockTotal={filteredStockTotal}
            metalTotal={filteredMetalTotal}
            propertyTotalPrice={filteredPropertyTotal}
            cryptoTotal={filteredCryptoTotal}
            userEmail={userEmail}
            customAssets={scopedCustomAssets}
            loanList={scopedLoanList}
          />
        );
      case 'dashboard':
        return (
          <Layout>
            {scopeFilterBanner}
            <DashboardOverview
              cashTotal={filteredCashTotal}
              stockTotal={filteredStockTotal}
              metalTotal={filteredMetalTotal}
              propertyTotalPrice={filteredPropertyTotal}
              cryptoTotal={filteredCryptoTotal}
              autoTotal={filteredAutoTotal}
              bondTotal={filteredBondTotal}
              retirementTotal={filteredRetirementTotal}
              savingsTotal={filteredSavingsTotal}
              commoditiesTotal={filteredCommoditiesTotal}
              artCollectiblesTotal={filteredArtTotal}
              luxuryWatchesTotal={filteredWatchesTotal}
              privateEquityTotal={filteredPETotal}
              intellectualPropertyTotal={filteredIPTotal}
              loanTotal={filteredLoanTotal}
              customAssets={scopedCustomAssets}
              onNavigate={handleNavigate}
            />
          </Layout>
        );
      case 'home':
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
        if (scopedAssetCount === 0) {
          return (
            <Layout>
              {scopeFilterBanner}
              <EmptyState
                title={`No ${scopeLabel(assetFilter).toLowerCase()} assets`}
                description={`Switch to "All Assets" or add a new ${scopeLabel(assetFilter).toLowerCase()} holding.`}
                actions={[
                  { label: 'Show all assets', onClick: () => setAssetFilter(SCOPE_FILTER.ALL) },
                  { label: 'Add asset', primary: true, onClick: () => setSelectedAsset('cash') },
                ]}
              />
            </Layout>
          );
        }
        return (
          <Layout>
            <div className="home-content">
              {scopeFilterBanner}
              <div className="vk-net-worth-hero">
                <p className="vk-net-worth-hero__label">Net Worth{assetFilter !== SCOPE_FILTER.ALL ? ` · ${scopeLabel(assetFilter)}` : ''}</p>
                <p className="vk-net-worth-hero__value">{formatCurrency(portfolioSummary.netWorth)}</p>
                <p className="vk-net-worth-hero__sub">
                  {scopedAssetCount} asset{scopedAssetCount !== 1 ? 's' : ''} tracked
                </p>
              </div>
              <h2 className="summary-title">Asset Summary</h2>
              <div className="summary-container">
                <div className="summary-section">
                  <div className="built-in-assets">
                    {homeSummaryCards.map((card) => (
                      <div key={card.id} className="summary-box" onClick={() => setSelectedAsset(card.id)}>
                        <h3>{card.title}</h3>
                        <p>{card.count} item{card.count !== 1 ? 's' : ''}</p>
                        <p>Value: ${card.value.toFixed(2)}</p>
                        {card.extra && <p>{card.extra}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                {scopedCustomAssets.length > 0 && (
                  <div className="summary-section">
                    <h2>Custom Assets</h2>
                    <div className="custom-assets">
                      {scopedCustomAssets.map(asset => (
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
         <button
           type="button"
           className="vk-mobile-menu-btn"
           onClick={() => setMobileMenuOpen(true)}
           aria-label="Open navigation menu"
         >
           <Menu size={22} />
         </button>
         <div className="title">
           <img src={logo_transparent} alt="Vault Knight" className="custom-title-icon" />
           Vault Knight
         </div>

         {/* Personal / Business Filter Dropdown */}
         <div className={`asset-filter-dropdown asset-filter-dropdown--${assetFilter}`}>
           <select 
             className="asset-filter-select"
             value={assetFilter}
             onChange={(e) => setAssetFilter(e.target.value)}
             aria-label="Filter by ownership"
           >
             <option value="all">All Assets</option>
             <option value="personal">Personal</option>
             <option value="business">Business</option>
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
      {mobileMenuOpen && (
        <div
          className="vk-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}
      <div className={`sidebar${mobileMenuOpen ? ' is-mobile-open' : ''}`}>
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

      <MobileNav
        activeView={['dashboard', 'home'].includes(selectedAsset) ? selectedAsset : 'other'}
        onNavigate={handleNavigate}
        onAdd={() => setSelectedAssetAndCloseSettings('createAsset')}
        onSearch={toggleSearch}
        onMenu={() => setMobileMenuOpen(true)}
      />

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