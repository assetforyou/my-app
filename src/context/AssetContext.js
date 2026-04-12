import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { auth } from '../firebase';
import FirestoreAssetService from '../firestoreAssetService';

// Create the context
const AssetContext = createContext(null);

/**
 * Custom hook to access asset context
 * @returns {Object} Asset context value
 */
export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};

/**
 * Provider component for asset state management
 */
export const AssetProvider = ({ children }) => {
  // State for all asset types
  const [assets, setAssets] = useState({
    cars: [],
    cash: [],
    stocks: [],
    metals: [],
    properties: [],
    loans: [],
    crypto: [],
    customAssets: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  // Calculate totals from assets
  const totals = useMemo(() => {
    return {
      auto: assets.cars.reduce((sum, car) => sum + parseFloat(car.value || 0), 0),
      cash: assets.cash.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0),
      stocks: assets.stocks.reduce((sum, stock) => sum + parseFloat(stock.total || 0), 0),
      metals: assets.metals.reduce((sum, metal) => sum + parseFloat(metal.total || 0), 0),
      properties: assets.properties.reduce((sum, property) => sum + parseFloat(property.price || 0), 0),
      propertyMonthlyCost: assets.properties.reduce((sum, property) => sum + parseFloat(property.totalMonthlyCost || 0), 0),
      loans: assets.loans.reduce((sum, loan) => sum + parseFloat(loan.loanValue || 0), 0),
      crypto: assets.crypto.reduce((sum, crypto) => sum + parseFloat(crypto.total || 0), 0),
      customAssets: assets.customAssets.reduce((sum, asset) => sum + parseFloat(asset.totalValue || 0), 0)
    };
  }, [assets]);

  // Calculate net worth
  const netWorth = useMemo(() => {
    const totalAssets = totals.auto + totals.cash + totals.stocks + totals.metals + 
                        totals.properties + totals.crypto + totals.customAssets;
    return totalAssets - totals.loans;
  }, [totals]);

  /**
   * Fetch all assets for the current user
   */
  const fetchAllAssets = useCallback(async (email) => {
    if (!email) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [cars, cash, stocks, metals, properties, loans, crypto, customAssets] = await Promise.all([
        FirestoreAssetService.fetchAssets('Autos', email),
        FirestoreAssetService.fetchAssets('Cash', email),
        FirestoreAssetService.fetchAssets('Stocks', email),
        FirestoreAssetService.fetchAssets('Metals', email),
        FirestoreAssetService.fetchAssets('Properties', email),
        FirestoreAssetService.fetchAssets('Loans', email),
        FirestoreAssetService.fetchAssets('Crypto', email),
        FirestoreAssetService.fetchAssets('CustomAssets', email)
      ]);

      setAssets({
        cars,
        cash,
        stocks,
        metals,
        properties,
        loans,
        crypto,
        customAssets
      });
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a new asset
   * @param {string} type - Asset type (e.g., 'Stocks', 'Cash')
   * @param {Object} assetData - Asset data
   * @returns {Promise<Object>} - Created asset
   */
  const addAsset = useCallback(async (type, assetData) => {
    try {
      const newAsset = await FirestoreAssetService.addAsset(type, {
        ...assetData,
        userEmail
      });
      
      // Map type to state key
      const stateKey = type.toLowerCase() + 's';
      setAssets(prev => ({
        ...prev,
        [stateKey]: [...prev[stateKey], newAsset]
      }));
      
      return newAsset;
    } catch (err) {
      console.error('Error adding asset:', err);
      throw err;
    }
  }, [userEmail]);

  /**
   * Update an existing asset
   * @param {string} type - Asset type
   * @param {string} assetId - Asset ID
   * @param {Object} updates - Updates to apply
   */
  const updateAsset = useCallback(async (type, assetId, updates) => {
    try {
      await FirestoreAssetService.updateAsset(type, assetId, updates);
      
      // Map type to state key
      const stateKey = type.toLowerCase() + 's';
      setAssets(prev => ({
        ...prev,
        [stateKey]: prev[stateKey].map(asset => 
          String(asset.id) === String(assetId) ? { ...asset, ...updates } : asset
        )
      }));
    } catch (err) {
      console.error('Error updating asset:', err);
      throw err;
    }
  }, []);

  /**
   * Delete an asset
   * @param {string} type - Asset type
   * @param {string} assetId - Asset ID
   */
  const deleteAsset = useCallback(async (type, assetId) => {
    try {
      await FirestoreAssetService.deleteAsset(type, assetId, userEmail);
      
      // Map type to state key
      const stateKey = type.toLowerCase() + 's';
      setAssets(prev => ({
        ...prev,
        [stateKey]: prev[stateKey].filter(asset => String(asset.id) !== String(assetId))
      }));
    } catch (err) {
      console.error('Error deleting asset:', err);
      throw err;
    }
  }, [userEmail]);

  /**
   * Fetch a single asset by ID
   * @param {string} type - Asset type
   * @param {string} assetId - Asset ID
   * @returns {Promise<Object|null>} - Asset data or null
   */
  const fetchAssetById = useCallback(async (type, assetId) => {
    try {
      return await FirestoreAssetService.fetchAssetById(type, assetId);
    } catch (err) {
      console.error('Error fetching asset by ID:', err);
      return null;
    }
  }, []);

  // Listen for auth state changes and fetch assets
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        fetchAllAssets(user.email);
      } else {
        setUserEmail(null);
        setAssets({
          cars: [],
          cash: [],
          stocks: [],
          metals: [],
          properties: [],
          loans: [],
          crypto: [],
          customAssets: []
        });
      }
    });

    return () => unsubscribe();
  }, [fetchAllAssets]);

  // Context value
  const value = {
    // State
    assets,
    loading,
    error,
    userEmail,
    totals,
    netWorth,
    
    // Actions
    fetchAllAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    fetchAssetById,
    
    // Convenience getters
    cars: assets.cars,
    cash: assets.cash,
    stocks: assets.stocks,
    metals: assets.metals,
    properties: assets.properties,
    loans: assets.loans,
    crypto: assets.crypto,
    customAssets: assets.customAssets
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

export default AssetContext;