// src/components/LandingPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('home');
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Perform any sign-out logic here, like clearing tokens
    navigate('/login');
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (selectedAsset) {
      case 'home':
        return <div>
           <h1>Noble Asset Vault</h1>
           <p>Assets Are Treasured, Not Just Stored.</p> 
        </div>;
      case 'auto':
        return <div>Manage your Auto Assets</div>;
      case 'cash':
        return <div>Manage your Cash Assets</div>;
      case 'digital':
        return <div>Manage your Digital Assets</div>;
      case 'stocks':
        return <div>Manage your Stock Assets</div>;
      case 'metals':
        return <div>Manage your Metal Assets</div>;
      default:
        return <div>Select an asset type from the sidebar</div>;
    }
  };

  return (
    <div className="landing-page">
      <div className="sidebar">
        <button onClick={() => setSelectedAsset('home')}>Home</button>
        <div className="dropdown">
          <button className="dropbtn">Assets</button>
          <div className="dropdown-content">
            <button onClick={() => setSelectedAsset('auto')}>Auto</button>
            <button onClick={() => setSelectedAsset('cash')}>Cash</button>
            <button onClick={() => setSelectedAsset('digital')}>Digital</button>
            <button onClick={() => setSelectedAsset('stocks')}>Stocks</button>
            <button onClick={() => setSelectedAsset('metals')}>Metals</button>
          </div>
        </div>
        <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        <button className="back-to-website-btn" onClick={handleBackToWebsite}>Back to Website</button>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default LandingPage;


