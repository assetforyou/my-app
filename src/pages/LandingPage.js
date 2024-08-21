import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './LandingPage.css';

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('home');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || 'User');
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigate('/login');
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (selectedAsset) {
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
      <div className="top-bar">
        <div className="title">Noble Asset Vault</div>
        <div className="user-email">{userEmail}</div>
      </div>
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




