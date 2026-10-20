/**
 * Privacy-Centric Google Analytics 4 (GA4) Integration
 * Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
 *
 * Principles:
 * 1. Safe Default: If VITE_GA_MEASUREMENT_ID is empty or missing, analytics remains completely disabled.
 * 2. Strict Consent: Analytics script does not load or run until explicit user consent is recorded.
 * 3. Zero PII: Never passes names, emails, phones, amounts, or private data to analytics.
 * 4. Deduplicated: Tracks React Router client navigation without duplicate pageviews.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const CONSENT_STORAGE_KEY = 'sct_cookie_consent';
let isInitialized = false;
let lastTrackedPath = '';

export type ConsentStatus = 'granted' | 'denied' | 'pending';

export const getConsentStatus = (): ConsentStatus => {
  if (typeof window === 'undefined') return 'pending';
  const val = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (val === 'granted') return 'granted';
  if (val === 'denied') return 'denied';
  return 'pending';
};

export const setConsentStatus = (status: 'granted' | 'denied'): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_STORAGE_KEY, status);

  if (status === 'granted') {
    initGA4();
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  } else {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  }
};

export const getMeasurementId = (): string => {
  return (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
};

export const isAnalyticsConfigured = (): boolean => {
  return Boolean(getMeasurementId() && getMeasurementId().startsWith('G-'));
};

/**
 * Initializes GA4 script dynamically only when consent is granted
 */
export const initGA4 = (): void => {
  if (typeof window === 'undefined' || isInitialized) return;
  const measurementId = getMeasurementId();

  if (!measurementId || !measurementId.startsWith('G-')) {
    // Analytics is intentionally not configured; keep disabled cleanly
    return;
  }

  if (getConsentStatus() !== 'granted') {
    return;
  }

  // Setup dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };

  // Default privacy consent config
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // Handled manually on route transition
    anonymize_ip: true,
    cookie_flags: 'SameSite=Lax;Secure',
  });

  // Inject script asynchronously
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  isInitialized = true;
};

/**
 * Tracks public page views cleanly without personal information
 */
export const trackPageView = (pathname: string, title?: string): void => {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsConfigured() || getConsentStatus() !== 'granted') return;

  if (lastTrackedPath === pathname) return; // Prevent duplicate triggers
  lastTrackedPath = pathname;

  if (!isInitialized) {
    initGA4();
  }

  const measurementId = getMeasurementId();
  if (window.gtag && measurementId) {
    window.gtag('event', 'page_view', {
      page_path: pathname,
      page_title: title || document.title,
      send_to: measurementId,
    });
  }
};

/**
 * Tracks privacy-safe aggregate engagement events (e.g. language toggle, cause click)
 */
export const trackSafeEvent = (eventName: string, params?: Record<string, string | number | boolean>): void => {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsConfigured() || getConsentStatus() !== 'granted') return;

  // Filter out any potential sensitive key names
  const safeParams: Record<string, string | number | boolean> = {};
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      const lower = key.toLowerCase();
      if (!lower.includes('email') && !lower.includes('phone') && !lower.includes('name') && !lower.includes('secret') && !lower.includes('token')) {
        safeParams[key] = val;
      }
    }
  }

  if (window.gtag) {
    window.gtag('event', eventName, safeParams);
  }
};
