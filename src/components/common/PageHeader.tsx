import React from "react";
import { cn } from "@/src/lib/utils";

interface PageHeaderProps {
  /** Optional badge label shown at top */
  badge?: string;
  /** Optional icon to accompany badge */
  badgeIcon?: React.ReactNode;
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
  accent?: "emerald" | "amber" | "neutral";
  /** Optional children for custom subheaders or stats */
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeIcon,
  title,
  description,
  align = "center",
  actions,
  className,
  accent = "emerald",
  children,
}) => {
  const badgeClasses = {
    emerald: "bg-emerald-50/90 text-[#14532d] border-emerald-200/80 shadow-2xs",
    amber: "bg-amber-50/90 text-amber-900 border-amber-200/80 shadow-2xs",
    neutral: "bg-stone-100 text-stone-800 border-stone-200 shadow-2xs",
  }[accent];

  return (
    <div
      className={cn(
        "relative pt-2 pb-6 sm:pb-8",
        align === "center" ? "text-center max-w-3xl mx-auto" : "text-left max-w-4xl",
        className
      )}
    >
      {/* 1. Dignified Badge Pill */}
      {badge && (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border mb-3.5 backdrop-blur-xs",
            badgeClasses,
            align === "center" ? "mx-auto" : ""
          )}
        >
          {badgeIcon && <span className="shrink-0">{badgeIcon}</span>}
          <span>{badge}</span>
        </div>
      )}

      {/* 2. Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
        {title}
      </h1>

      {/* 3. Subtle Warm Decorative Divider */}
      <div
        className={cn(
          "flex items-center gap-2 mt-3.5 mb-2",
          align === "center" ? "justify-center" : "justify-start"
        )}
      >
        <span className="w-8 h-px bg-amber-400/60" />
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="w-8 h-px bg-amber-400/60" />
      </div>

      {/* 4. Description */}
      {description && (
        <p
          className={cn(
            "text-sm sm:text-base text-stone-600 leading-relaxed font-normal",
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
