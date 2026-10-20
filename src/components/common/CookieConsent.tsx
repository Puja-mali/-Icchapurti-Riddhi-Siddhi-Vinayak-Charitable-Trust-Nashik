import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, X } from 'lucide-react';
import { Button } from './Button';
import { getConsentStatus, setConsentStatus, isAnalyticsConfigured } from '@/src/lib/analytics';
import { Link } from 'react-router-dom';

export const CookieConsent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Only show banner if user has not yet decided
    const status = getConsentStatus();
    if (status === 'pending') {
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to custom event so footer can re-open consent settings anytime
  useEffect(() => {
    const handleReopen = () => {
      setIsOpen(true);
      setShowDetails(true);
    };
    window.addEventListener('sct_open_cookie_preferences', handleReopen);
    return () => window.removeEventListener('sct_open_cookie_preferences', handleReopen);
  }, []);

  if (!isOpen) return null;

  const handleAcceptAll = () => {
    setConsentStatus('granted');
    setIsOpen(false);
  };

  const handleEssentialOnly = () => {
    setConsentStatus('denied');
    setIsOpen(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-xl p-4 sm:p-5 text-stone-900 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-[#14532d]">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-stone-900">
                Privacy & Cookie Choices
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                Icchapurti Riddhi Siddhi Vinayak Charitable Trust
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
            aria-label="Close and keep only essential cookies"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          We use strictly necessary cookies to keep your donor session secure. With your permission, we also use privacy-conscious analytics to measure site visits without collecting personal identification.
        </p>

        {showDetails && (
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] space-y-2 text-stone-700">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Essential Session Cookies:</span> Always active. Required for secure HttpOnly donor login and anti-tamper security.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Cookie className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900">Anonymous Analytics:</span> {isAnalyticsConfigured() ? 'Measures aggregate site visits to improve public outreach. Never records names, phone numbers, or payment data.' : 'Currently not enabled on this deployment.'}
              </div>
            </div>
            <div className="pt-1 text-[10px] text-stone-500">
              Read our full{' '}
              <Link to="/privacy" className="underline font-semibold text-[#14532d]" onClick={() => setIsOpen(false)}>
                Privacy Policy
              </Link>{' '}
              for details on our verified data practices.
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline cursor-pointer"
          >
            {showDetails ? 'Hide details' : 'Learn more'}
          </button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEssentialOnly}
              className="text-xs py-1.5 px-3 border-stone-300"
            >
              Essential Only
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAcceptAll}
              className="text-xs py-1.5 px-3 bg-[#14532d] hover:bg-[#0f4023] text-white"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
