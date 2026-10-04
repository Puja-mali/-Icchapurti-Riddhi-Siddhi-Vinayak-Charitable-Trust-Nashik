import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Flame, Droplets, Utensils, ShieldCheck, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/src/components/common/Button";
import { useKumbhMode } from "@/src/context/KumbhModeContext";
import { useLanguage } from "@/src/context/LanguageContext";

export const KumbhHomeBanner: React.FC = () => {
  const { isKumbhMode, kumbhConfig } = useKumbhMode();
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  if (!isKumbhMode) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#1b3d2f] via-[#154634] to-[#12382a] text-white py-12 px-4 sm:px-6 lg:px-8 border-y border-amber-500/30 shadow-md">
      {/* Decorative Gold & Emerald Background Motifs */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-amber-400/20 blur-2xl" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-400/20 blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left info */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                <span>
                  {language === "mr" ? "सिंहस्थ कुंभमेळा २०२७" : `${kumbhConfig.editionName} (${kumbhConfig.targetYear})`}
                </span>
              </span>
              <span className="text-xs text-emerald-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{language === "mr" ? "नाशिक - त्र्यंबकेश्वर, महाराष्ट्र" : kumbhConfig.location}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {language === "mr"
                ? "नाशिक सिंहस्थ कुंभमेळा २०२७ - पूर्वतयारी व भाविक सेवा"
                : "Advance Pilgrim & Civic Seva for Nashik Simhastha 2027"}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {language === "mr"
                ? "पवित्र गोदावरी तीरावर येणाऱ्या कोट्यवधी भाविकांच्या सेवेसाठी शुद्ध पिण्याचे पाणी, २४ तास अखंड अन्नछत्र, आरोग्य शिबिरे व घाट स्वच्छता मोहीम."
                : "In anticipation of millions of spiritual seekers congregating at the holy Godavari, we are establishing decentralized pure drinking water kiosks, zero-waste ghat sanitation drives, and 24/7 free Annachhatra kitchen operations."}
            </p>

            {/* Quick 3 Pillar Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-emerald-200 bg-black/20 px-3 py-2 rounded border border-emerald-700/30">
                <Droplets className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>{language === "mr" ? "शुद्ध जल कियोस्क" : "Clean Water Kiosks"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-200 bg-black/20 px-3 py-2 rounded border border-emerald-700/30">
                <Utensils className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{language === "mr" ? "२४/७ अखंड अन्नछत्र" : "24/7 Mega Annachhatra"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-200 bg-black/20 px-3 py-2 rounded border border-emerald-700/30">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{language === "mr" ? "प्रथमोपचार व मदत केंद्र" : "First-Aid & Help Desk"}</span>
              </div>
            </div>
          </div>

          {/* Right Action Box */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-stretch gap-3 w-full sm:w-auto shrink-0">
            <Link to="/kumbh-seva">
              <Button
                size="md"
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold border border-amber-300/50 shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {language === "mr" ? "कुंभ सेवा पोर्टल पहा" : "Explore Kumbh Seva Portal"}
              </Button>
            </Link>
            <Link to="/volunteer">
              <Button
                size="md"
                variant="outline"
                className="w-full bg-white/10 hover:bg-white/20 text-white border-emerald-400/40 text-xs"
              >
                {t.navVolunteer}
              </Button>
            </Link>
            <div className="text-[11px] text-emerald-300/80 text-center">
              {kumbhConfig.planningNote}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
