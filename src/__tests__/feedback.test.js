import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../components/Toast';
import FeedbackWidget from '../components/FeedbackWidget';

test('opens feedback widget and shows textarea', async () => {
  render(
    <ToastProvider>
      <FeedbackWidget />
    </ToastProvider>
  );

  const fab = screen.getByLabelText(/Send feedback/i);
  expect(fab).toBeInTheDocument();

  await userEvent.click(fab);

  expect(screen.getByLabelText(/Feedback message/i)).toBeInTheDocument();
});
