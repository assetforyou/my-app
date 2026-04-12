# 🚀 Vault Knight - Actionable Implementation Plan

This document provides a prioritized, actionable roadmap for implementing improvements to the Vault Knight application.

---

## 📋 Phase 1: Critical Fixes & Foundation (Week 1-2)

### 1.1 Security Fixes (HIGH PRIORITY)

#### Task 1.1.1: Move Firebase Config to Environment Variables
**Files to modify:** `src/firebase.js`, `.env`, `.env.example`

```javascript
// src/firebase.js - Update to use environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
```

**.env additions:**
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Estimated time:** 30 minutes

---

#### Task 1.1.2: Enhance Firestore Security Rules
**Files to modify:** `firestore.rules`

Add validation rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwnerEmail(emailField) {
      return isSignedIn()
        && emailField is string
        && request.auth.token.email == emailField;
    }
    
    function createsWithOwnEmail() {
      return isSignedIn()
        && request.resource.data.userEmail is string
        && request.auth.token.email == request.resource.data.userEmail;
    }
    
    function isValidNumber(field) {
      return request.resource.data[field] is number 
        && request.resource.data[field] >= 0;
    }
    
    // Stock validation
    function isValidStock() {
      return createsWithOwnEmail()
        && request.resource.data.keys().hasAll(['symbol', 'shares', 'price'])
        && request.resource.data.symbol is string
        && request.resource.data.symbol.size() > 0
        && request.resource.data.symbol.size() <= 10
        && isValidNumber('shares')
        && isValidNumber('price');
    }
    
    match /stocks/{docId} {
      allow read: if isOwnerEmail(resource.data.userEmail);
      allow create: if isValidStock();
      allow update: if isOwnerEmail(resource.data.userEmail)
        && request.resource.data.keys().hasOnly(['symbol', 'shares', 'price', 'total', 'userEmail'])
        && isValidNumber('shares')
        && isValidNumber('price');
      allow delete: if isOwnerEmail(resource.data.userEmail);
    }
    
    // Cash validation
    function isValidCash() {
      return createsWithOwnEmail()
        && request.resource.data.keys().hasAll(['amount', 'name'])
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && isValidNumber('amount');
    }
    
    match /cash/{docId} {
      allow read: if isOwnerEmail(resource.data.userEmail);
      allow create: if isValidCash();
      allow update: if isOwnerEmail(resource.data.userEmail)
        && isValidNumber('amount');
      allow delete: if isOwnerEmail(resource.data.userEmail);
    }
    
    // Add similar validation for other collections
    match /{document=**} {
      allow read, write: if false; // Deny all other access
    }
  }
}
```

**Estimated time:** 2 hours

---

#### Task 1.1.3: Add Input Validation to Forms
**Files to modify:** All asset form pages (`src/pages/Stocks.js`, `src/pages/Cash.js`, etc.)

Create a reusable validation utility:

```javascript
// src/utils/validation.js
export const validateStock = (data) => {
  const errors = {};
  
  if (!data.symbol || data.symbol.trim().length === 0) {
    errors.symbol = 'Stock symbol is required';
  } else if (data.symbol.length > 10) {
    errors.symbol = 'Symbol must be 10 characters or less';
  }
  
  if (!data.shares || data.shares <= 0) {
    errors.shares = 'Number of shares must be greater than 0';
  }
  
  if (!data.price || data.price < 0) {
    errors.price = 'Price must be a positive number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCash = (data) => {
  const errors = {};
  
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Account name is required';
  }
  
  if (data.amount === undefined || data.amount < 0) {
    errors.amount = 'Amount must be a positive number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Export other validators...
```

**Estimated time:** 4 hours

---

### 1.2 GlobalSearch Fix (COMPLETED)
✅ Fixed CSS issue with search modal overlay visibility.

---

## 📋 Phase 2: State Management & Architecture (Week 3-4)

### 2.1 Create Asset Context
**New file:** `src/context/AssetContext.js`

```javascript
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import FirestoreAssetService from '../firestoreAssetService';

const AssetContext = createContext(null);

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};

export const AssetProvider = ({ children }) => {
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

  const addAsset = useCallback(async (type, assetData) => {
    try {
      const newAsset = await FirestoreAssetService.addAsset(type, {
        ...assetData,
        userEmail
      });
      
      setAssets(prev => ({
        ...prev,
        [type.toLowerCase() + 's']: [...prev[type.toLowerCase() + 's'], newAsset]
      }));
      
      return newAsset;
    } catch (err) {
      console.error('Error adding asset:', err);
      throw err;
    }
  }, [userEmail]);

  const updateAsset = useCallback(async (type, assetId, updates) => {
    try {
      await FirestoreAssetService.updateAsset(type, assetId, updates);
      
      setAssets(prev => ({
        ...prev,
        [type.toLowerCase() + 's']: prev[type.toLowerCase() + 's'].map(asset => 
          asset.id === assetId ? { ...asset, ...updates } : asset
        )
      }));
    } catch (err) {
      console.error('Error updating asset:', err);
      throw err;
    }
  }, []);

  const deleteAsset = useCallback(async (type, assetId) => {
    try {
      await FirestoreAssetService.deleteAsset(type, assetId, userEmail);
      
      setAssets(prev => ({
        ...prev,
        [type.toLowerCase() + 's']: prev[type.toLowerCase() + 's'].filter(asset => asset.id !== assetId)
      }));
    } catch (err) {
      console.error('Error deleting asset:', err);
      throw err;
    }
  }, [userEmail]);

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

  const value = {
    assets,
    loading,
    error,
    userEmail,
    fetchAllAssets,
    addAsset,
    updateAsset,
    deleteAsset
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};
```

**Estimated time:** 3 hours

---

### 2.2 Update App.js to Use AssetProvider
**Files to modify:** `src/App.js`

```javascript
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider, useToast } from './components/Toast';
import { AssetProvider } from './context/AssetContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalSearch from './components/GlobalSearch';
import KeyboardShortcuts from './components/KeyboardShortcuts';

function AppContent() {
  const { success } = useToast();
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/landing') {
      success('Welcome to Vault Knight! Use Ctrl+K to search or Ctrl+N to add a new asset.', 6000);
    }
  }, [location.pathname, success]);

  return (
    <>
      <GlobalSearch />
      <KeyboardShortcuts />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AssetProvider>
          <AppContent />
        </AssetProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
```

**Estimated time:** 30 minutes

---

### 2.3 Refactor LandingPage to Use AssetContext
**Files to modify:** `src/pages/LandingPage.js`

Replace state management with context:

```javascript
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { Settings, X, Search } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useAssets } from '../context/AssetContext';
import Layout from '../components/AdLayout';
// ... other imports

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const settingsRef = useRef(null);
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  // Use AssetContext
  const { assets, loading, error, userEmail, deleteAsset: deleteAssetFromContext } = useAssets();

  // Calculate totals from context
  const autoTotal = assets.cars.reduce((sum, car) => sum + parseFloat(car.value || 0), 0);
  const cashTotal = assets.cash.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
  const stockTotal = assets.stocks.reduce((sum, stock) => sum + parseFloat(stock.total), 0);
  const metalTotal = assets.metals.reduce((sum, metal) => sum + parseFloat(metal.total), 0);
  const propertyTotalPrice = assets.properties.reduce((sum, property) => sum + parseFloat(property.price || 0), 0);
  const propertyTotalMonthlyCost = assets.properties.reduce((sum, property) => sum + parseFloat(property.totalMonthlyCost || 0), 0);
  const loanTotal = assets.loans.reduce((sum, loan) => sum + parseFloat(loan.loanValue || 0), 0);
  const cryptoTotal = assets.crypto.reduce((sum, crypto) => sum + parseFloat(crypto.total || 0), 0);

  // ... rest of the component using context instead of local state

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await deleteAssetFromContext('CustomAssets', assetId);
        success('Asset has been deleted.');
      } catch (err) {
        showError('Failed to delete asset. Please try again.');
      }
    }
  };

  // ... rest of the component
}
```

**Estimated time:** 4 hours

---

## 📋 Phase 3: Performance & UX Improvements (Week 5-6)

### 3.1 Add Loading Skeletons
**New file:** `src/components/LoadingSkeleton.js`

```javascript
import React from 'react';
import { Skeleton } from 'react-bootstrap';

const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  if (type === 'card') {
    return (
      <div className="skeleton-container">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="skeleton-table-row">
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={80} />
            <Skeleton variant="text" width={60} />
            <Skeleton variant="text" width={120} />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
```

**Add to CSS:** `src/style/LoadingSkeleton.css`

```css
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.skeleton-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.skeleton-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-table-row {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}
```

**Estimated time:** 2 hours

---

### 3.2 Implement Error Boundary
**New file:** `src/components/ErrorBoundary.js`

```javascript
import React from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
    
    // TODO: Send to error tracking service (Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger" className="text-center">
            <AlertTriangle className="mb-3" size={48} />
            <Alert.Heading>Something went wrong</Alert.Heading>
            <p>
              We're sorry, but there was an error loading this section.
              Please try refreshing the page.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="outline-danger" onClick={this.handleReset}>
                <RefreshCw size={16} className="me-2" />
                Refresh Page
              </Button>
              <Button variant="outline-secondary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-start">
                <summary className="text-muted">Error Details (Development)</summary>
                <pre className="mt-2 p-3 bg-light rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Update App.js to use ErrorBoundary:**

```javascript
import ErrorBoundary from './components/ErrorBoundary';

// Wrap routes with ErrorBoundary
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route
    path="/landing"
    element={
      <ErrorBoundary>
        <ProtectedRoute>
          <LandingPage />
        </ProtectedRoute>
      </ErrorBoundary>
    }
  />
</Routes>
```

**Estimated time:** 2 hours

---

### 3.3 Add Lazy Loading for Heavy Components
**Files to modify:** `src/App.js`

```javascript
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

// Lazy load heavy components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));

// Loading component
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// In Routes:
<Route
  path="/landing"
  element={
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    </ProtectedRoute>
  }
/>
```

**Add loader CSS:** `src/index.css`

```css
.page-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

**Estimated time:** 1 hour

---

## 📋 Phase 4: Feature Enhancements (Week 7-8)

### 4.1 Enhanced GlobalSearch with Recent Items
**Files to modify:** `src/components/GlobalSearch.js`

Add recent searches functionality:

```javascript
import React, { useState, useEffect, useRef, useCallback } from 'react';
// ... existing imports

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vaultknight_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((searchItem) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.id !== searchItem.id);
      const updated = [searchItem, ...filtered].slice(0, 5); // Keep last 5
      localStorage.setItem('vaultknight_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    
    // Save to recent searches
    saveRecentSearch({
      id: item.id,
      name: item.name,
      icon: item.icon,
      category: item.category
    });
    
    if (item.path) {
      navigate(item.path);
      if (item.action) {
        window.dispatchEvent(new CustomEvent('vaultknight-navigate', { 
          detail: { action: item.action } 
        }));
      }
    }
  };

  // Show recent searches when query is empty
  const displayResults = query.trim() === '' ? recentSearches : results;

  return (
    <>
      {/* Search Trigger Button */}
      <button 
        className="global-search-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
      >
        <Search size={18} />
        <span className="search-hint">Search...</span>
        <kbd className="search-shortcut">
          <Keyboard size={12} />
          K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          // ... existing modal code
          
          {displayResults.length > 0 && (
            <div className="search-results">
              {query.trim() === '' && recentSearches.length > 0 && (
                <div className="search-section-header">
                  <span>Recent Searches</span>
                  <button 
                    className="clear-recent-btn"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('vaultknight_recent_searches');
                    }}
                  >
                    Clear
                  </button>
                </div>
              )}
              {displayResults.map((item, index) => (
                // ... existing result rendering
              ))}
            </div>
          )}
        )}
      </AnimatePresence>
    </>
  );
};
```

**Add CSS for recent searches:**

```css
.search-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-recent-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.clear-recent-btn:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}
```

**Estimated time:** 3 hours

---

### 4.2 Add Keyboard Shortcuts Documentation Modal
**New file:** `src/components/KeyboardShortcutsModal.js`

```javascript
import React, { useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/KeyboardShortcutsModal.css';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Open search', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], description: 'Create new asset', category: 'Actions' },
  { keys: ['Escape'], description: 'Close modal/search', category: 'Navigation' },
  { keys: ['↑', '↓'], description: 'Navigate search results', category: 'Navigation' },
  { keys: ['Enter'], description: 'Select search result', category: 'Navigation' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['Ctrl', ','], description: 'Open settings', category: 'Navigation' },
  { keys: ['?'], description: 'Show this help', category: 'Help' },
];

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="shortcuts-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="shortcuts-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="shortcuts-header">
              <div className="shortcuts-title">
                <Keyboard size={24} />
                <h2>Keyboard Shortcuts</h2>
              </div>
              <button className="shortcuts-close" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="shortcuts-content">
              {['Navigation', 'Actions', 'Help'].map(category => (
                <div key={category} className="shortcuts-category">
                  <h3>{category}</h3>
                  <div className="shortcuts-list">
                    {shortcuts
                      .filter(s => s.category === category)
                      .map((shortcut, index) => (
                        <div key={index} className="shortcut-item">
                          <span className="shortcut-description">{shortcut.description}</span>
                          <div className="shortcut-keys">
                            {shortcut.keys.map((key, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span className="key-separator">+</span>}
                                <kbd className="key">{key}</kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="shortcuts-footer">
              <p>Press <kbd>?</kbd> to open this help, <kbd>Escape</kbd> to close</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
```

**Estimated time:** 2 hours

---

## 📋 Phase 5: Testing & Quality (Week 9-10)

### 5.1 Set Up Testing Infrastructure
**Install dependencies:**

```bash
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event jest jest-environment-jsdom
```

**Create test setup file:** `src/setupTests.js`

```javascript
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn()
  },
  db: {},
  storage: {}
}));

// Mock Toast context
jest.mock('./components/Toast', () => ({
  ToastProvider: ({ children }) => children,
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn()
  })
}));
```

**Create example test:** `src/components/__tests__/GlobalSearch.test.js`

```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GlobalSearch from '../GlobalSearch';

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('GlobalSearch', () => {
  it('renders search trigger button', () => {
    renderWithRouter(<GlobalSearch />);
    expect(screen.getByLabelText('Open search')).toBeInTheDocument();
  });

  it('opens search modal when trigger is clicked', () => {
    renderWithRouter(<GlobalSearch />);
    fireEvent.click(screen.getByLabelText('Open search'));
    expect(screen.getByPlaceholderText('Search assets, pages, and actions...')).toBeInTheDocument();
  });

  it('closes modal when Escape is pressed', () => {
    renderWithRouter(<GlobalSearch />);
    fireEvent.click(screen.getByLabelText('Open search'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Search assets, pages, and actions...')).not.toBeInTheDocument();
  });

  it('filters results based on query', () => {
    renderWithRouter(<GlobalSearch />);
    fireEvent.click(screen.getByLabelText('Open search'));
    fireEvent.change(screen.getByPlaceholderText('Search assets, pages, and actions...'), {
      target: { value: 'cash' }
    });
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.queryByText('Stocks')).not.toBeInTheDocument();
  });
});
```

**Update package.json:**

```json
{
  "scripts": {
    "test": "react-scripts test --watchAll=false",
    "test:watch": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false"
  }
}
```

**Estimated time:** 4 hours

---

### 5.2 Add ESLint & Prettier Configuration
**Install dependencies:**

```bash
npm install --save-dev eslint-plugin-react-hooks prettier husky lint-staged
```

**Create .eslintrc.js:**

```javascript
module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
  }
};
```

**Create .prettierrc:**

```json
{
  "semi": true,
  "trailingComma": "none",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Create .lintstagedrc:**

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss,json,md}": [
    "prettier --write"
  ]
}
```

**Update package.json:**

```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "prepare": "husky install"
  }
}
```

**Estimated time:** 1 hour

---

## 📋 Summary & Timeline

| Phase | Duration | Tasks | Priority |
|-------|----------|-------|----------|
| Phase 1 | Week 1-2 | Security fixes, validation | HIGH |
| Phase 2 | Week 3-4 | State management refactor | HIGH |
| Phase 3 | Week 5-6 | Performance & UX | MEDIUM |
| Phase 4 | Week 7-8 | Feature enhancements | MEDIUM |
| Phase 5 | Week 9-10 | Testing & quality | MEDIUM |

**Total Estimated Time:** 30-35 hours of development work

---

## 🚀 Quick Wins (Can be done immediately)

1. ✅ **GlobalSearch Fix** - Already completed
2. **Add loading skeletons** - 2 hours
3. **Add error boundary** - 2 hours
4. **Add keyboard shortcuts modal** - 2 hours
5. **Update manifest.json** - 30 minutes
6. **Add FAQ section** - 2 hours
7. **Add tooltips** - 3 hours

---

## 📝 Next Steps

1. Start with Phase 1 security fixes (highest priority)
2. Implement state management refactor (Phase 2)
3. Add quick wins for immediate UX improvement
4. Continue with remaining phases based on priorities

This plan provides a clear, actionable roadmap for improving the Vault Knight application.