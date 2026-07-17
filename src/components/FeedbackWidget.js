import React, { useState } from 'react';
import { useToast } from './Toast';
import { trackEvent } from '../utils/analytics';
import '../style/FeedbackWidget.css';

function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { success, error } = useToast();

  const submitFeedback = async () => {
    if (!message.trim()) {
      error('Please enter feedback before submitting.');
      return;
    }
    setSending(true);
    trackEvent('feedback_submit_attempt');
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'App user',
          email: 'noreply@vaultknight.local',
          inquiryType: 'Feedback',
          message,
        }),
      });
      success('Thanks — your feedback was sent.');
      trackEvent('feedback_submitted');
      setMessage('');
      setOpen(false);
    } catch (err) {
      console.error('Feedback send error', err);
      error('Failed to send feedback. Try again later.');
      trackEvent('feedback_submit_failed', { error: String(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="vk-feedback-container" aria-hidden={!open}>
      <button type="button" className="vk-feedback-fab" aria-label="Send feedback" onClick={() => { setOpen(!open); trackEvent('open_feedback_widget'); }}>
        💬
      </button>

      {open && (
        <div className="vk-feedback-modal" role="dialog" aria-label="Feedback form">
          <textarea
            aria-label="Feedback message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share a bug, idea, or what you like..."
          />
          <div className="vk-feedback-actions">
            <button type="button" className="vk-feedback-cancel" onClick={() => setOpen(false)}>Cancel</button>
            <button type="button" className="vk-feedback-send" onClick={submitFeedback} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackWidget;
