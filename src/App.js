// src/App.js
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider, useToast } from './components/Toast';
import { AssetProvider } from './context/AssetContext';
import ErrorBoundary from './components/ErrorBoundary';
import { PageLoader } from './components/LoadingSkeleton';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalSearch from './components/GlobalSearch';
import KeyboardShortcuts from './components/KeyboardShortcuts';

// Lazy load heavy components for better initial load performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Bonds = lazy(() => import('./pages/Bonds'));
const Retirement = lazy(() => import('./pages/Retirement'));
const Savings = lazy(() => import('./pages/Savings'));

// Toast wrapper component to handle global notifications
function AppContent() {
  const { success } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Show welcome message on landing page
    if (location.pathname === '/landing') {
      success('Welcome to Vault Knight! Use Ctrl+K to search or Ctrl+N to add a new asset.', 6000);
    }
  }, [location.pathname, success]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <>
      {/* Global Search Component (only on non-auth pages) */}
      {!isAuthPage && <GlobalSearch />}
      
      {/* Keyboard Shortcuts Handler */}
      <KeyboardShortcuts />
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/bonds" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Bonds /></Suspense></ProtectedRoute>} />
        <Route path="/retirement" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Retirement /></Suspense></ProtectedRoute>} />
        <Route path="/savings" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Savings /></Suspense></ProtectedRoute>} />
        <Route
          path="/landing"
          element={
            <ErrorBoundary>
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <LandingPage />
                </Suspense>
              </ProtectedRoute>
            </ErrorBoundary>
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
