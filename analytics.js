/**
 * VentiStudio Analytics Tracker
 * Lightweight analytics for tracking user behavior
 */

const Analytics = {
  // Initialize analytics
  init() {
    if (!window.location.pathname.includes('/admin')) {
      this.trackPageView();
      this.trackEvents();
    }
  },

  // Track page views
  trackPageView() {
    const pageData = {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    // Store in localStorage for batch processing
    this.storeEvent('pageview', pageData);
  },

  // Track custom events
  trackEvents() {
    // Track button clicks
    document.querySelectorAll('[data-track]').forEach(element => {
      element.addEventListener('click', () => {
        this.trackEvent('button_click', {
          button: element.getAttribute('data-track'),
          page: window.location.pathname
        });
      });
    });

    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', () => {
        this.trackEvent('form_submit', {
          form: form.id || 'unknown',
          page: window.location.pathname
        });
      });
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) {
          this.trackEvent('scroll_depth', { depth: maxScroll });
        }
      }
    });

    // Track time on page
    const pageLoadTime = performance.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((performance.now() - pageLoadTime) / 1000);
      this.trackEvent('time_on_page', { seconds: timeOnPage });
    });
  },

  // Store event in localStorage
  storeEvent(type, data) {
    const events = JSON.parse(localStorage.getItem('ventistudio_analytics') || '[]');
    events.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 events
    if (events.length > 50) {
      events.shift();
    }
    
    localStorage.setItem('ventistudio_analytics', JSON.stringify(events));
  },

  // Track custom events
  trackEvent(eventName, eventData = {}) {
    this.storeEvent('custom', {
      event: eventName,
      ...eventData,
      page: window.location.pathname
    });
  },

  // Get analytics summary
  getSummary() {
    const events = JSON.parse(localStorage.getItem('ventistudio_analytics') || '[]');
    return {
      totalEvents: events.length,
      pageviews: events.filter(e => e.type === 'pageview').length,
      customEvents: events.filter(e => e.type === 'custom').length,
      lastUpdated: new Date().toISOString()
    };
  },

  // Send analytics to server
  sendToServer(endpoint = '/api/analytics') {
    const events = JSON.parse(localStorage.getItem('ventistudio_analytics') || '[]');
    if (events.length === 0) return;

    // In production, send to backend
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    }).catch(err => console.log('Analytics send failed:', err));

    // Clear events after sending
    localStorage.removeItem('ventistudio_analytics');
  }
};

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Analytics.init());
} else {
  Analytics.init();
}

// Send analytics periodically
setInterval(() => Analytics.sendToServer(), 300000); // Every 5 minutes

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Analytics;
}