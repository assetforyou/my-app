import React, { useState } from 'react';
import { X, Wallet, Target, BarChart3, ChevronRight, ChevronLeft } from 'lucide-react';
import '../style/OnboardingModal.css';

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

  const handleFinish = () => {
    localStorage.setItem('vk_onboarding_complete', 'true');
    onComplete?.();
  };

  const handleAddAndFinish = () => {
    handleFinish();
    onAddAsset?.();
  };

  return (
    <div className="vk-onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="vk-onboarding-title">
      <div className="vk-onboarding-modal">
        <button type="button" className="vk-onboarding-close" onClick={handleFinish} aria-label="Skip onboarding">
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
            <button type="button" className="vk-onboarding-btn vk-onboarding-btn--primary" onClick={() => setStep(step + 1)}>
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <>
              <button type="button" className="vk-onboarding-btn vk-onboarding-btn--ghost" onClick={handleFinish}>
                Explore dashboard
              </button>
              <button type="button" className="vk-onboarding-btn vk-onboarding-btn--primary" onClick={handleAddAndFinish}>
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
