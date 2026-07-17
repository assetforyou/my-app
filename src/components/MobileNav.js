import React from 'react';
import { LayoutDashboard, LayoutGrid, Plus, Search, Menu } from 'lucide-react';
import '../style/MobileNav.css';
import { trackEvent } from '../utils/analytics';

const MobileNav = ({ activeView, onNavigate, onAdd, onSearch, onMenu }) => (
  <nav className="vk-mobile-nav" aria-label="Mobile navigation">
    <button
      type="button"
      className={`vk-mobile-nav__item${activeView === 'dashboard' ? ' is-active' : ''}`}
      onClick={() => { trackEvent('navigate', { to: 'dashboard' }); onNavigate('dashboard'); }}
      aria-current={activeView === 'dashboard' ? 'page' : undefined}
    >
      <LayoutDashboard size={22} strokeWidth={2} />
      <span>Dashboard</span>
    </button>
    <button
      type="button"
      className={`vk-mobile-nav__item${activeView === 'home' ? ' is-active' : ''}`}
      onClick={() => { trackEvent('navigate', { to: 'home' }); onNavigate('home'); }}
      aria-current={activeView === 'home' ? 'page' : undefined}
    >
      <LayoutGrid size={22} strokeWidth={2} />
      <span>Assets</span>
    </button>
    <button type="button" className="vk-mobile-nav__item vk-mobile-nav__item--add" onClick={() => { trackEvent('navigate_add'); onAdd(); }} aria-label="Add asset">
      <Plus size={26} strokeWidth={2.5} />
    </button>
    <button type="button" className="vk-mobile-nav__item" onClick={() => { trackEvent('open_search'); onSearch(); }} aria-label="Search">
      <Search size={22} strokeWidth={2} />
      <span>Search</span>
    </button>
    <button type="button" className="vk-mobile-nav__item" onClick={() => { trackEvent('open_menu'); onMenu(); }} aria-label="Open menu">
      <Menu size={22} strokeWidth={2} />
      <span>Menu</span>
    </button>
  </nav>
);

export default MobileNav;
