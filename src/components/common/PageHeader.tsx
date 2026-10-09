import React from "react";
import { cn } from "@/src/lib/utils";

interface PageHeaderProps {
  /** Optional badge label shown at top */
  badge?: string;
  /** Optional icon to accompany badge */
  badgeIcon?: React.ReactNode;
  /** Optional quiet text kicker (no pill) */
  kicker?: string;
  /** Main page title */
  title: string;
  /** Subtitle / descriptive summary */
  description?: string;
  /** Alignment */
  align?: "left" | "center";
  /** Optional custom action elements (e.g. CTA buttons, search) */
  actions?: React.ReactNode;
  /** Additional container classes */
  className?: string;
  /** Theme accent */
  accent?: "emerald" | "amber" | "sandstone" | "neutral";
  /** Optional children for custom subheaders or stats */
  children?: React.ReactNode;
  /** Visual presentation mode */
  variant?: "editorial" | "cinematic" | "compact";
  /** Optional background image for cinematic mode */
  backgroundImage?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeIcon,
  kicker,
  title,
  description,
  align = "center",
  actions,
  className,
  accent = "sandstone",
  children,
  variant = "editorial",
  backgroundImage,
}) => {
  // Cinematic variant with authentic photography / Godavari twilight overlay
  if (variant === "cinematic") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-stone-950 text-white border border-stone-800 shadow-lg mb-8 sm:mb-12",
          className
        )}
      >
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 pointer-events-none"
          />
        )}
        {/* Cinematic gradient overlays: Godavari light, sandstone warmth, deep charcoal */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/70 to-stone-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/30 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-12 sm:py-16 max-w-4xl">
          {/* Unboxed editorial kicker */}
          {(kicker || badge) && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-3.5">
              {badgeIcon && <span className="shrink-0">{badgeIcon}</span>}
              <span>{kicker || badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-[1.12]">
            {title}
          </h1>

          {/* Antique brass subtle accent divider */}
          <div className="flex items-center gap-2 mt-4 mb-3">
            <span className="w-10 h-px bg-amber-400/80" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-6 h-px bg-amber-400/40" />
          </div>

          {description && (
            <p className="text-sm sm:text-base text-stone-200/90 leading-relaxed max-w-2xl font-normal">
              {description}
            </p>
          )}

          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    );
  }

  // Editorial presentation mode (Nashik warm stone & Godavari light aesthetic)
  return (
    <div
      className={cn(
        "relative pt-3 pb-7 sm:pb-9",
        align === "center" ? "text-center max-w-3xl mx-auto" : "text-left max-w-4xl",
        className
      )}
    >
      {/* Ambient warm light wash */}
      <div
        className={cn(
          "pointer-events-none absolute -top-12 h-44 w-72 rounded-full bg-amber-200/20 blur-3xl",
          align === "center" ? "left-1/2 -translate-x-1/2" : "-left-10"
        )}
      />

      {/* 1. Dignified Unboxed Kicker or Subtle Badge */}
      {(kicker || badge) && (
        <div
          className={cn(
            "flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-900/90 mb-3",
            align === "center" ? "justify-center" : "justify-start"
          )}
        >
          {badgeIcon && <span className="shrink-0 text-amber-700">{badgeIcon}</span>}
          <span className="font-sans">{kicker || badge}</span>
        </div>
      )}

      {/* 2. Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-stone-900 tracking-tight leading-[1.14]">
        {title}
      </h1>

      {/* 3. Subtle Warm Antique Brass Decorative Divider */}
      <div
        className={cn(
          "flex items-center gap-2 mt-3.5 mb-2.5",
          align === "center" ? "justify-center" : "justify-start"
        )}
      >
        <span className="w-8 h-px bg-amber-500/70" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        <span className="w-8 h-px bg-amber-500/70" />
      </div>

      {/* 4. Description in readable charcoal */}
      {description && (
        <p
          className={cn(
            "text-sm sm:text-base text-stone-700 leading-relaxed font-normal",
            align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"
          )}
        >
          {description}
        </p>
      )}

      {/* 5. Optional Actions */}
      {actions && (
        <div
          className={cn(
            "mt-6 flex flex-wrap gap-3",
            align === "center" ? "justify-center" : "justify-start"
          )}
        >
          {actions}
        </div>
      )}

      {/* 6. Optional Children */}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};
