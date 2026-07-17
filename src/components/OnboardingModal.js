import React, { useState, useEffect, useRef } from 'react';
import { X, Wallet, Target, BarChart3, ChevronRight, ChevronLeft } from 'lucide-react';
import '../style/OnboardingModal.css';
import { trackEvent } from '../utils/analytics';

const STEPS = [
  {
    icon: Wallet,
    title: 'Welcome to Vault Knight',
    body: 'Track stocks, property, crypto, collectibles, and more — all in one secure vault. Personal and business assets stay organized.',
  },
  {
    icon: Target,
    title: 'Add your first asset',
    body: 'Start with whatever you own today: a bank account, stock position, or property. Use the assistant (bottom-right) to add assets in plain English.',
  },
  {
    icon: BarChart3,
    title: 'See the full picture',
    body: 'Your dashboard shows net worth, allocation, and insights based on real data — no fake numbers. Advanced analytics unlock as you add assets.',
  },
];

const OnboardingModal = ({ onComplete, onAddAsset }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const closeBtnRef = useRef(null);
  const primaryBtnRef = useRef(null);

  useEffect(() => {
    // focus the primary action when modal opens
    if (primaryBtnRef.current) primaryBtnRef.current.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight') {
        if (!isLast) setStep((s) => Math.min(s + 1, STEPS.length - 1));
      } else if (e.key === 'ArrowLeft') {
        if (step > 0) setStep((s) => Math.max(s - 1, 0));
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isLast, step]);

  const handleFinish = () => {
    localStorage.setItem('vk_onboarding_complete', 'true');
    trackEvent('onboarding_complete', { step });
    onComplete?.();
  };

  const handleAddAndFinish = () => {
    handleFinish();
    trackEvent('onboarding_add_asset', { step });
    onAddAsset?.();
  };

  return (
    <div className="vk-onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="vk-onboarding-title">
      <div className="vk-onboarding-modal">
        <button ref={closeBtnRef} type="button" className="vk-onboarding-close" onClick={handleFinish} aria-label="Skip onboarding">
          <X size={20} />
        </button>

        <div className="vk-onboarding-progress">
          {STEPS.map((_, i) => (
            <span key={i} className={`vk-onboarding-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>

        <div className="vk-onboarding-icon" aria-hidden>
          <Icon size={36} strokeWidth={1.5} />
        </div>

        <h2 id="vk-onboarding-title" className="vk-onboarding-title">{current.title}</h2>
        <p className="vk-onboarding-body">{current.body}</p>

        <div className="vk-onboarding-actions">
          {step > 0 && (
            <button type="button" className="vk-onboarding-btn vk-onboarding-btn--ghost" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          {!isLast ? (
            <button ref={primaryBtnRef} type="button" className="vk-onboarding-btn vk-onboarding-btn--primary" onClick={() => setStep(step + 1)}>
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <>
              <button type="button" className="vk-onboarding-btn vk-onboarding-btn--ghost" onClick={handleFinish}>
                Explore dashboard
              </button>
              <button ref={primaryBtnRef} type="button" className="vk-onboarding-btn vk-onboarding-btn--primary" onClick={handleAddAndFinish}>
                Add first asset
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
