import React, { useState } from "react";
import { cn } from "@/src/lib/utils";

interface TrustEmblemProps {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Is rendered on top of the hero video / transparent navbar */
  isTransparent?: boolean;
  /** Additional custom classes */
  className?: string;
  /** Whether to show the bottom ornamental ribbon tab */
  showRibbonTab?: boolean;
}

export const TrustEmblem: React.FC<TrustEmblemProps> = ({
  size = "md",
  isTransparent = false,
  className,
  showRibbonTab = true,
}) => {
  const [imageError, setImageError] = useState(false);

  // Dimensions based on vertical badge structure inspired by traditional temple plaques
  const dimensions = {
    sm: {
      container: "w-[34px] min-h-[44px]",
      imageBox: "w-[28px] h-[28px]",
      omText: "text-[8px]",
      ribbonHeight: "h-2",
    },
    md: {
      container: "w-[42px] min-h-[54px]",
      imageBox: "w-[36px] h-[36px]",
      omText: "text-[9px]",
      ribbonHeight: "h-2.5",
    },
    lg: {
      container: "w-[52px] min-h-[66px]",
      imageBox: "w-[44px] h-[44px]",
      omText: "text-[10px]",
      ribbonHeight: "h-3",
    },
  }[size];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-start shrink-0 select-none group/emblem transition-all duration-300",
        dimensions.container,
        className
      )}
      title="इच्छापूर्ती रिद्धी-सिध्दी विनायक चॅरिटेबल ट्रस्ट, नाशिक"
    >
      {/* 1. Main Vertical Plaque / Badge Body */}
      <div
        className={cn(
          "w-full rounded-t-md rounded-b-[4px] relative overflow-hidden flex flex-col items-center pt-1 px-0.5 pb-1 transition-all duration-300 shadow-md",
          // Deep emerald green background with subtle devotional gold rim
          "bg-gradient-to-b from-[#0b3319] via-[#14532d] to-[#072411]",
          "border border-amber-400/70",
          // Glow and contrast separation
          isTransparent
            ? "shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-300/30"
            : "shadow-[0_2px_8px_rgba(0,0,0,0.18)] ring-1 ring-emerald-950/20"
        )}
      >
        {/* Subtle Top Gold Filigree Line */}
        <div className="w-4/5 h-[1.5px] bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-0.5 opacity-90" />

        {/* 2. Central Medallion Frame for Sacred Bappa */}
        <div
          className={cn(
            "relative rounded-full flex items-center justify-center p-0.5 overflow-hidden transition-transform duration-300",
            dimensions.imageBox,
            // Fine golden circular bezel
            "bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
          )}
        >
          {/* Inner ring background */}
          <div className="w-full h-full rounded-full bg-[#0a2714] flex items-center justify-center overflow-hidden p-0.5">
            {!imageError ? (
              <img
                src="/src/assets/images/trust_bappa_emblem_1791393897279.jpg"
                alt="श्री इच्छापूर्ती रिद्धी सिद्धी विनायक"
                className="w-full h-full object-contain object-center scale-[1.08] transition-transform duration-300 group-hover/emblem:scale-[1.14]"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.includes("trust_bappa_emblem")) {
                    target.src = "/bappa.jpeg";
                  } else {
                    setImageError(true);
                  }
                }}
                loading="eager"
                referrerPolicy="no-referrer"
              />
            ) : (
              // Refined Vector Deity Silhouette Fallback
              <svg
                viewBox="0 0 40 40"
                className="w-full h-full text-amber-300 fill-current"
                aria-hidden="true"
              >
                {/* Crown / Mukut */}
                <path
                  d="M17 6 L20 3 L23 6 L22 9 L18 9 Z"
                  fill="#f59e0b"
                />
                {/* Head / Ears / Trunk */}
                <path
                  d="M12 12 Q9 15 11 19 Q13 22 17 21 C17 25 18 29 20 31 C22 31 23 29 23 25 Q27 22 29 19 Q31 15 28 12 Q20 10 12 12 Z"
                  fill="#f97316"
                />
                {/* Modak */}
                <circle cx="28" cy="24" r="2.5" fill="#fef08a" />
                {/* Tilak */}
                <line x1="20" y1="11" x2="20" y2="15" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </div>

        {/* 3. Sacred Inscription / Om Micro-Badge */}
        <div className="mt-0.5 flex items-center justify-center gap-0.5 leading-none">
          <span
            className={cn(
              "font-serif font-bold text-amber-300 tracking-wider",
              dimensions.omText
            )}
          >
            ॥ ॐ ॥
          </span>
        </div>
      </div>

      {/* 4. Asymmetric/Ornate Ribbon Plaque Tail (inspired by vertical badge architecture) */}
      {showRibbonTab && (
        <div className="w-full flex justify-center -mt-[1px]">
          <div
            className={cn(
              "relative w-[75%] h-[5px] bg-[#0b3319] border-x border-b border-amber-400/70",
              "flex items-center justify-center",
              // Elegant angled cut / notched banner bottom
              "rounded-b-[2px]",
              isTransparent
                ? "shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                : "shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
            )}
          >
            {/* Saffron / Warm Gold Accent Diamond */}
            <div className="w-1.5 h-1.5 rotate-45 bg-amber-400 border border-amber-200/80 shadow-xs" />
          </div>
        </div>
      )}
    </div>
  );
};
