import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, Users, ArrowRight, Heart } from "lucide-react";
import { Cause } from "@/src/types";
import { Button } from "../common/Button";
import { formatCurrency, cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/context/LanguageContext";
import { getLocalizedCause, getLocalizedCategory } from "@/src/lib/localization";

interface CauseCardProps {
  cause: Cause;
  className?: string;
}

export const CauseCard: React.FC<CauseCardProps> = ({ cause: rawCause, className }) => {
  const { language, t } = useLanguage();
  const cause = getLocalizedCause(rawCause, language);
  const shouldReduceMotion = useReducedMotion();
  const hasTarget = Boolean(cause.targetAmount && cause.targetAmount > 0);
  const percentage = hasTarget
    ? Math.min(100, Math.round(((cause.raisedAmount || 0) / (cause.targetAmount || 1)) * 100))
    : 0;

  const urgentLabel = language === "mr" ? "तातडीची सेवा" : language === "hi" ? "अति आवश्यक सेवा" : "Urgent Seva";
  const verifiedLabel = language === "mr" ? "सत्यापित उपक्रम" : language === "hi" ? "सत्यापित उपक्रम" : "Verified Initiative";
  const ofTargetLabel = language === "mr" ? "लक्ष्य" : language === "hi" ? "लक्ष्य" : "target";
  const accountedLabel = language === "mr" ? "निधी संकलित" : language === "hi" ? "धनराशि एकत्रित" : "Accounted";
  const contributionsLabel = language === "mr" ? "सहभाग" : language === "hi" ? "योगदान" : "contributions";
  const openSupportLabel = language === "mr" ? "सहभागासाठी खुले" : language === "hi" ? "सहयोग हेतु खुला" : "Open for seva support";
  const viewDetailsLabel = language === "mr" ? "तपशील पहा" : language === "hi" ? "विवरण देखें" : "View Details";
  const supportLabel = language === "mr" ? "सहकार्य करा" : language === "hi" ? "सहयोग करें" : "Support";

  return (
    <motion.div
      className={cn(
        "group bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 shadow-xs hover:border-emerald-700/40 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between",
        className
      )}
      whileHover={!shouldReduceMotion ? { y: -4 } : undefined}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div>
        {/* Cause Image & Tags */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-100 border-b border-stone-200">
          <img
            src={cause.imageUrl}
            alt={cause.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Smooth subtle overlay on hover */}
          <div className="absolute inset-0 bg-stone-950/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Bottom gradient with authentic unboxed metadata */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent p-3 pt-6 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-stone-200 truncate">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{cause.location}</span>
            </div>
            {cause.urgent && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-black/50 px-2 py-0.5 rounded border border-amber-400/40 shrink-0">
                {urgentLabel}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 pb-4">
          {/* Unboxed category kicker */}
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/90 mb-1.5 flex items-center gap-2">
            <span>{getLocalizedCategory(cause.category, language)}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="text-stone-500 font-normal normal-case">{verifiedLabel}</span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 group-hover:text-stone-950 transition-colors line-clamp-2 leading-snug">
            <Link to={`/causes/${cause.id}`}>{cause.title}</Link>
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 line-clamp-2 leading-relaxed">
            {cause.tagline}
          </p>

          {/* Funding Target or Neutral Status */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 space-y-2">
            {hasTarget ? (
              <>
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-stone-900 font-mono">
                    {formatCurrency(cause.raisedAmount || 0)}
                  </span>
                  <span className="text-stone-500">
                    {ofTargetLabel} <span className="font-mono">{formatCurrency(cause.targetAmount)}</span>
                  </span>
                </div>

                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-700 h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-stone-500 pt-0.5">
                  <span className="font-semibold text-stone-800">{percentage}% {accountedLabel}</span>
                  {cause.donorCount > 0 ? (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-stone-400" />
                      {cause.donorCount} {contributionsLabel}
                    </span>
                  ) : (
                    <span>{openSupportLabel}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-[11px] text-stone-500 flex items-center justify-between">
                <span className="italic text-stone-500">{openSupportLabel}</span>
                {cause.donorCount > 0 && (
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <Users className="w-3 h-3 text-stone-400" />
                    {cause.donorCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 sm:px-6 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-3">
        <Link
          to={`/causes/${cause.id}`}
          className="text-xs font-semibold text-stone-700 hover:text-[#14532d] flex items-center gap-1.5 transition-colors group/link"
        >
          <span>{viewDetailsLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>

        <Link to={`/donate?cause=${cause.id}`}>
          <Button
            size="sm"
            variant="primary"
            className="text-xs px-3.5 py-1.5 h-8 bg-[#14532d] hover:bg-[#0f4023] text-white"
            leftIcon={<Heart className="w-3 h-3 fill-current text-amber-300" />}
          >
            {supportLabel}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
