import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '../components/Toast';
import OnboardingModal from '../components/OnboardingModal';

test('renders onboarding modal and shows first step', () => {
  render(
    <ToastProvider>
      <OnboardingModal onComplete={() => {}} onAddAsset={() => {}} />
    </ToastProvider>
  );

  expect(screen.getByText(/Welcome to Vault Knight/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Skip onboarding/i })).toBeInTheDocument();
});
