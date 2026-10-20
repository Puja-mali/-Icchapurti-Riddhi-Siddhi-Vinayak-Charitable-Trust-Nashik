import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, Heart, Phone, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/src/components/common/Button';
import { TrustEmblem } from '@/src/components/common/TrustEmblem';
import { SEO } from '@/src/components/common/SEO';
import { useLanguage } from '@/src/context/LanguageContext';

export const NotFound: React.FC = () => {
  const { language } = useLanguage();

  return (
    <>
      <SEO
        title="Page Not Found (404)"
        description="The page you requested could not be found on the Icchapurti Riddhi Siddhi Vinayak Charitable Trust website."
        noIndex={true}
      />

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-xl text-center space-y-6 sm:space-y-8">
          {/* Emblem & 404 Badge */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <TrustEmblem size="md" className="mb-2" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold tracking-wide">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>404 • Page Not Found</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {language === 'mr'
                ? 'हे पृष्ठ उपलब्ध नाही'
                : language === 'hi'
                ? 'यह पृष्ठ उपलब्ध नहीं है'
                : 'Page Not Found'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
              {language === 'mr'
                ? 'आपण शोधत असलेले पृष्ठ हलवले गेले असावे किंवा त्याचा पत्ता बदलला असेल. खाली दिलेल्या मुख्य पर्यायांमधून आपण पुढे जाऊ शकता.'
                : language === 'hi'
                ? 'आप जिस पृष्ठ को खोज रहे हैं वह स्थानांतरित हो गया है या पता बदल गया है। कृपया नीचे दिए गए मुख्य लिंक देखें।'
                : 'The link you followed may be incorrect, moved, or temporarily unavailable. Please explore our official Trust sections below.'}
            </p>
          </div>

          {/* Quick Nav Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
            <Link
              to="/"
              className="p-3 sm:p-3.5 bg-white rounded-xl border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-xs transition-all group"
            >
              <Home className="w-4 h-4 text-[#14532d] mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">Home</div>
              <div className="text-[10px] text-stone-500">Main portal</div>
            </Link>

            <Link
              to="/causes"
              className="p-3 sm:p-3.5 bg-white rounded-xl border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-xs transition-all group"
            >
              <Compass className="w-4 h-4 text-[#14532d] mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">Causes</div>
              <div className="text-[10px] text-stone-500">Active campaigns</div>
            </Link>

            <Link
              to="/donate"
              className="p-3 sm:p-3.5 bg-white rounded-xl border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-xs transition-all group"
            >
              <Heart className="w-4 h-4 text-[#14532d] mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">Donate</div>
              <div className="text-[10px] text-stone-500">Verified giving</div>
            </Link>

            <Link
              to="/contact"
              className="p-3 sm:p-3.5 bg-white rounded-xl border border-stone-200/90 hover:border-emerald-700/40 hover:shadow-xs transition-all group"
            >
              <Phone className="w-4 h-4 text-[#14532d] mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-stone-900">Contact</div>
              <div className="text-[10px] text-stone-500">Trust secretariat</div>
            </Link>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto text-xs sm:text-sm bg-[#14532d] hover:bg-[#0f4023] text-white px-5 py-2.5 rounded-xl shadow-xs"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Return to Trust Homepage
              </Button>
            </Link>
            <Link to="/about">
              <Button
                variant="outline"
                size="md"
                className="w-full sm:w-auto text-xs sm:text-sm border-stone-300 text-stone-700 px-5 py-2.5 rounded-xl"
              >
                About Our Trust
              </Button>
            </Link>
          </div>

          {/* Trust Registration Identification */}
          <div className="pt-4 border-t border-stone-200/80 flex items-center justify-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik (Reg. No. E/1341)</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
