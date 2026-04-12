import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Keyboard, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/GlobalSearch.css';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Searchable items - this would be populated from actual data in a real implementation
  const searchableItems = [
    { id: 'home', name: 'Home', type: 'page', icon: '🏠', path: '/landing', category: 'Navigation' },
    { id: 'cash', name: 'Cash', type: 'asset', icon: '💵', path: '/landing', action: 'cash', category: 'Assets' },
    { id: 'stocks', name: 'Stocks', type: 'asset', icon: '📈', path: '/landing', action: 'stocks', category: 'Assets' },
    { id: 'crypto', name: 'Cryptocurrency', type: 'asset', icon: '₿', path: '/landing', action: 'crypto', category: 'Assets' },
    { id: 'property', name: 'Property', type: 'asset', icon: '🏡', path: '/landing', action: 'property', category: 'Assets' },
    { id: 'auto', name: 'Autos', type: 'asset', icon: '🚗', path: '/landing', action: 'auto', category: 'Assets' },
    { id: 'metals', name: 'Metals', type: 'asset', icon: '🥇', path: '/landing', action: 'metals', category: 'Assets' },
    { id: 'loan', name: 'Loans', type: 'asset', icon: '🏦', path: '/landing', action: 'loan', category: 'Assets' },
    { id: 'analytics', name: 'Analytics Dashboard', type: 'page', icon: '📊', path: '/landing', action: 'analytics', category: 'Analytics' },
    { id: 'goals', name: 'Goal Tracker', type: 'page', icon: '🎯', path: '/landing', action: 'analytics', category: 'Analytics' },
    { id: 'risk', name: 'Risk Assessment', type: 'page', icon: '⚠️', path: '/landing', action: 'analytics', category: 'Analytics' },
    { id: 'tax', name: 'Tax Impact Analysis', type: 'page', icon: '📋', path: '/landing', action: 'analytics', category: 'Analytics' },
    { id: 'create-asset', name: 'Create Custom Asset', type: 'action', icon: '➕', path: '/landing', action: 'createAsset', category: 'Actions' },
    { id: 'settings', name: 'Account Settings', type: 'action', icon: '⚙️', path: '/landing', action: 'accountSettings', category: 'Settings' },
    { id: 'signout', name: 'Sign Out', type: 'action', icon: '🚪', path: '/login', category: 'Settings' },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setSelectedIndex(0);
      }
    };

    // Listen for toggle search event from LandingPage search icon
    const handleToggleSearch = () => {
      setIsOpen(true);
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('vaultknight-toggle-search', handleToggleSearch);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('vaultknight-toggle-search', handleToggleSearch);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = searchableItems.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    );
    
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    
    if (item.path) {
      navigate(item.path);
      
      // If there's an action, we need to communicate it to the LandingPage
      // This would require a more sophisticated state management in a real app
      if (item.action) {
        window.dispatchEvent(new CustomEvent('vaultknight-navigate', { 
          detail: { action: item.action } 
        }));
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

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
          <motion.div
            className="search-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsOpen(false);
              setQuery('');
              setSelectedIndex(0);
            }}
          >
            <motion.div
              className="search-modal"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search assets, pages, and actions..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {query && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setQuery('');
                      setSelectedIndex(0);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {results.length > 0 && (
                <div className="search-results">
                  {results.map((item, index) => (
                    <div
                      key={item.id}
                      className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className="result-icon">{item.icon}</span>
                      <div className="result-content">
                        <span className="result-name">{item.name}</span>
                        <span className="result-category">{item.category}</span>
                      </div>
                      <span className={`result-type type-${item.type}`}>
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {query && results.length === 0 && (
                <div className="search-no-results">
                  <p>No results found for "{query}"</p>
                  <small>Try searching for assets, pages, or actions</small>
                </div>
              )}

              <div className="search-footer">
                <span className="footer-item">
                  <kbd>↑</kbd> <kbd>↓</kbd> to navigate
                </span>
                <span className="footer-item">
                  <kbd>↵</kbd> to select
                </span>
                <span className="footer-item">
                  <kbd>esc</kbd> to close
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch;