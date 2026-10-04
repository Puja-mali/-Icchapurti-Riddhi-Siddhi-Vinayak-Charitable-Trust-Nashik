import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, Users, ArrowRight, Heart } from "lucide-react";
import { Cause } from "@/src/types";
import { Button } from "../common/Button";
import { formatCurrency, cn } from "@/src/lib/utils";

interface CauseCardProps {
  cause: Cause;
  className?: string;
}

export const CauseCard: React.FC<CauseCardProps> = ({ cause, className }) => {
  const shouldReduceMotion = useReducedMotion();
  const percentage = Math.min(
    100,
    Math.round((cause.raisedAmount / cause.targetAmount) * 100)
  );

  return (
    <motion.div
      className={cn(
        "group bg-white rounded-md border border-stone-200/90 shadow-2xs hover:border-stone-400 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between",
        className
      )}
      whileHover={!shouldReduceMotion ? { y: -5 } : undefined}
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
          <div className="absolute inset-0 bg-stone-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Top badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-900/85 text-white shadow-2xs backdrop-blur-xs">
              {cause.category}
            </span>
            {cause.urgent && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#991b1b] text-white shadow-2xs">
                Urgent Need
              </span>
            )}
          </div>

          {/* Location pill on bottom left */}
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-white text-xs font-medium bg-stone-900/75 px-2 py-0.5 rounded backdrop-blur-xs">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate max-w-[200px] text-[11px]">{cause.location}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 pb-4">
          <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-[#14532d] transition-colors line-clamp-2 leading-snug">
            <Link to={`/causes/${cause.id}`}>{cause.title}</Link>
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
            {cause.tagline}
          </p>

          {/* Funding Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-bold text-stone-900">
                {formatCurrency(cause.raisedAmount)}
              </span>
              <span className="text-stone-500">
                of {formatCurrency(cause.targetAmount)} target
              </span>
            </div>

            <div className="w-full bg-stone-100 h-1.5 rounded overflow-hidden">
              <motion.div
                className="bg-[#14532d] h-full rounded"
                initial={{ width: 0 }}
                whileInView={{ width: `${percentage}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-stone-500 pt-0.5">
              <span className="font-semibold text-[#14532d]">{percentage}% Accounted</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-stone-400" />
                {cause.donorCount} contributions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3 bg-[#faf8f5] border-t border-stone-100 flex items-center justify-between gap-3">
        <Link
          to={`/causes/${cause.id}`}
          className="text-xs font-semibold text-stone-700 hover:text-[#14532d] flex items-center gap-1.5 transition-colors group/link"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
        </Link>

        <Link to={`/donate?cause=${cause.id}`}>
          <Button
            size="sm"
            variant="primary"
            className="text-xs px-3 py-1 h-8"
            leftIcon={<Heart className="w-3 h-3 fill-current text-amber-200" />}
          >
            Support
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
