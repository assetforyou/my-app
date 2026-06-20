import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, ArrowRight, User, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SEARCH_NAV_ITEMS, filterSearchItems } from '../data/searchIndex';
import { scopeLabel } from '../utils/assetScope';
import '../style/GlobalSearch.css';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const allItems = useMemo(
    () => [...SEARCH_NAV_ITEMS, ...portfolioItems],
    [portfolioItems]
  );

  const results = useMemo(
    () => filterSearchItems(allItems, query),
    [allItems, query]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    const handleToggleSearch = () => setIsOpen(true);
    const handlePortfolio = (e) => setPortfolioItems(e.detail?.items || []);

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('vaultknight-toggle-search', handleToggleSearch);
    window.addEventListener('vaultknight-portfolio-search', handlePortfolio);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('vaultknight-toggle-search', handleToggleSearch);
      window.removeEventListener('vaultknight-portfolio-search', handlePortfolio);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((item) => {
    close();
    if (item.path && item.path !== '/landing') {
      navigate(item.path);
      return;
    }
    navigate('/landing');
    if (item.action) {
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('vaultknight-navigate', { detail: { action: item.action } }));
      });
    }
  }, [close, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="global-search-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open search (Ctrl+K)"
      >
        <Search size={18} />
        <span className="search-hint">Search…</span>
        <kbd className="search-shortcut">⌘K</kbd>
      </button>

      {isOpen && (
        <div className="search-modal-overlay" onClick={close} role="presentation">
          <div
            className="search-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                className="search-input"
                placeholder="Search pages, assets, or holdings…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label="Clear">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="search-results">
              {results.length > 0 ? (
                results.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`search-result${index === selectedIndex ? ' selected' : ''}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="result-content">
                      <span className="result-name">{item.name}</span>
                      <span className="result-meta">
                        {item.category}
                        {item.scope && (
                          <span className={`result-scope result-scope--${item.scope}`}>
                            {item.scope === 'business' ? <Building2 size={10} /> : <User size={10} />}
                            {scopeLabel(item.scope)}
                          </span>
                        )}
                      </span>
                    </div>
                    <span className={`result-type type-${item.type}`}>{item.type}</span>
                    <ArrowRight size={16} className="result-arrow" aria-hidden />
                  </button>
                ))
              ) : query ? (
                <div className="search-no-results">
                  <p>No results for &ldquo;{query}&rdquo;</p>
                </div>
              ) : null}
            </div>

            <div className="search-footer">
              <span><kbd>↑↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalSearch;
