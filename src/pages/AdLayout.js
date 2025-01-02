// src/components/Layout.jsx
import React, { useEffect } from 'react';
import './AdStyle.css';

const AdSidebar = () => {
    useEffect(() => {
      // Load Google AdSense script
      const loadAdScript = () => {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndleware.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
  
        // Initialize ads
        script.onload = () => {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        };
      };
  
      loadAdScript();
  
      return () => {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
          if (script.src.includes('adsbygoogle')) {
            script.remove();
          }
        }
      };
    }, []);
  
    return (
      <div className="ad-content">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client="YOUR-AD-CLIENT-ID"
          data-ad-slot="YOUR-AD-SLOT-ID"
          data-ad-format="vertical"
          data-full-width-responsive="true"
        />
      </div>
    );
  };
  
  const Layout = ({ children }) => {
    return (
      <div className="page-container">
        <main className="main-content">
          {children}
        </main>
        <aside className="ad-sidebar">
          <div className="ad-header">
            <h2>Advertisement's</h2>
          </div>
          <AdSidebar />
        </aside>
      </div>
    );
  };
  
  export default Layout;