// Lightweight analytics helper — uses dataLayer if available, otherwise logs.
export function trackEvent(name, payload = {}) {
  try {
    if (typeof window !== 'undefined' && window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...payload });
    } else if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, payload);
    } else {
      // Fallback: console for local/dev
      // eslint-disable-next-line no-console
      console.info('[analytics]', name, payload);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Analytics track failed', err);
  }
}

export default {
  trackEvent,
};
