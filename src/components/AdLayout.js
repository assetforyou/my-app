import React, { useEffect, useState, useCallback, useRef } from 'react';
import '../style/AdStyle.css';
import { AD_RAIL_PROMOS } from '../data/adRailPromos';

const ADSENSE_SCRIPT_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const ADSENSE_CLIENT = process.env.REACT_APP_ADSENSE_CLIENT_ID;
const ADSENSE_SLOT = process.env.REACT_APP_ADSENSE_SLOT;

function adsenseConfigured() {
  return (
    ADSENSE_CLIENT &&
    ADSENSE_SLOT &&
    ADSENSE_CLIENT.startsWith('ca-pub-') &&
    !ADSENSE_CLIENT.includes('YOUR') &&
    !String(ADSENSE_SLOT).includes('YOUR')
  );
}

function AdSenseUnit() {
  const enabled = adsenseConfigured();
  const pushed = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const pushAd = () => {
      if (pushed.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* duplicate fill */
      }
    };

    let script = document.querySelector(`script[src="${ADSENSE_SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = ADSENSE_SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('load', pushAd, { once: true });
      document.head.appendChild(script);
    } else if (window.adsbygoogle) {
      queueMicrotask(pushAd);
    } else {
      script.addEventListener('load', pushAd, { once: true });
    }

    return undefined;
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="vk-ad-sense-wrap">
      <p className="vk-ad-sense-label">Partner network</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '280px' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

function RotatingPromoRail() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const advance = useCallback(() => {
    setFade(false);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % AD_RAIL_PROMOS.length);
      setFade(true);
    }, 220);
  }, []);

  useEffect(() => {
    const id = window.setInterval(advance, 10000);
    return () => window.clearInterval(id);
  }, [advance]);

  const slot = AD_RAIL_PROMOS[index];

  return (
    <article
      className={`vk-ad-promo vk-ad-promo--${slot.accent} ${fade ? 'vk-ad-promo--visible' : ''}`}
      aria-live="polite"
    >
      <span className="vk-ad-promo__tag">{slot.tag}</span>
      <h3 className="vk-ad-promo__title">{slot.title}</h3>
      <p className="vk-ad-promo__body">{slot.body}</p>
      <div className="vk-ad-promo__dots" aria-hidden>
        {AD_RAIL_PROMOS.map((p, i) => (
          <span key={p.title} className={i === index ? 'is-active' : ''} />
        ))}
      </div>
    </article>
  );
}

function AdSidebar() {
  const hasAdsense = adsenseConfigured();

  return (
    <div className="ad-sidebar-scroll">
      <header className="ad-header">
        <h2 className="ad-header__title">Spotlight</h2>
        <p className="ad-header__sub">
          Timed insights for your portfolio. Add AdSense below for live display ads from Google.
        </p>
      </header>
      <div className="ad-body">
        <RotatingPromoRail />
        {!hasAdsense && (
          <p className="vk-ad-config-hint">
            For live ads: create a display unit in AdSense, then set{' '}
            <code>REACT_APP_ADSENSE_CLIENT_ID</code> (<code>ca-pub-…</code>) and{' '}
            <code>REACT_APP_ADSENSE_SLOT</code> (numeric slot id) in <code>.env</code> and rebuild.
          </p>
        )}
        <AdSenseUnit />
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div className="page-container">
      <main className="main-content">{children}</main>
      <aside className="ad-sidebar" aria-label="Sponsored and resources">
        <AdSidebar />
      </aside>
    </div>
  );
}

export default Layout;
