import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { TRUST_LOGO_PATH, TRUST_LOGO_FALLBACK, TRUST_BRAND } from "@/src/config/trustBrand";

export interface TrustEmblemProps {
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Is rendered on top of the hero video / transparent navbar */
  isTransparent?: boolean;
  /** Additional container classes */
  className?: string;
  /** Image-specific classes */
  imgClassName?: string;
  /** Whether to show the bottom ornamental ribbon tab (preserved for compatibility) */
  showRibbonTab?: boolean;
  /** Optional custom logo image source */
  logoSrc?: string;
  /** Accessible alt text */
  altText?: string;
}

/**
 * Trust Emblem / Logo Component
 *
 * Displays the authentic Trust logo (`public/image.png`) directly at an enlarged,
 * easily recognizable scale for senior citizens and visitors with weak eyesight.
 * Completely free of any artificial green card, borders, shadows, or clipping.
 * Preserves the original 1600x1280 aspect ratio with `object-fit: contain`.
 */
export const TrustEmblem: React.FC<TrustEmblemProps> = ({
  size = "md",
  isTransparent = false,
  className,
  imgClassName,
  logoSrc,
  altText,
}) => {
  const [imageError, setImageError] = useState(false);
  const activeLogo = logoSrc || TRUST_LOGO_PATH;

  // Natural, balanced Trust emblem sizing preserving the original 1600:1280 (1.25) aspect ratio
  const sizeClasses = {
    xs: "h-7 sm:h-8 w-auto",
    sm: "h-8 sm:h-9 w-auto",
    md: "h-10 sm:h-11 md:h-12 w-auto",
    lg: "h-14 sm:h-16 w-auto",
    xl: "h-20 sm:h-24 w-auto",
  }[size];

  const accessibleAlt = altText || TRUST_BRAND.altText || TRUST_BRAND.name;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0 select-none bg-transparent p-0 m-0",
        className
      )}
      title={TRUST_BRAND.marathiName || TRUST_BRAND.name}
    >
      {!imageError && activeLogo ? (
        <img
          src={activeLogo}
          alt={accessibleAlt}
          className={cn(
            "object-contain transition-transform duration-200 block",
            sizeClasses,
            isTransparent && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]",
            imgClassName
          )}
          style={{ aspectRatio: "1600 / 1280" }}
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== TRUST_LOGO_FALLBACK && !target.src.endsWith(TRUST_LOGO_FALLBACK)) {
              target.src = TRUST_LOGO_FALLBACK;
            } else {
              setImageError(true);
            }
          }}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className={cn("flex items-center justify-center text-amber-500", sizeClasses)}>
          <svg viewBox="0 0 40 40" className="w-full h-full fill-current" aria-hidden="true">
            <path d="M17 6 L20 3 L23 6 L22 9 L18 9 Z" fill="#f59e0b" />
            <path
              d="M12 12 Q9 15 11 19 Q13 22 17 21 C17 25 18 29 20 31 C22 31 23 29 23 25 Q27 22 29 19 Q31 15 28 12 Q20 10 12 12 Z"
              fill="#f97316"
            />
            <circle cx="28" cy="24" r="2.5" fill="#fef08a" />
            <line x1="20" y1="11" x2="20" y2="15" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};
