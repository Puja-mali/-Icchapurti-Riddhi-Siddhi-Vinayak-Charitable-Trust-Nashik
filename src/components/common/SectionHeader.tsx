import React from "react";
import { cn } from "@/src/lib/utils";

interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  badgeContent?: React.ReactNode;
  tagVariant?: "emerald" | "amber" | "neutral";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  tag,
  title,
  description,
  align = "center",
  className,
  badgeContent,
  tagVariant = "emerald",
}) => {
  const tagColor = {
    emerald: "text-[#14532d] bg-emerald-50/90 border-emerald-200/80",
    amber: "text-amber-900 bg-amber-50/90 border-amber-200/80",
    neutral: "text-stone-700 bg-stone-100 border-stone-200",
  }[tagVariant];

  return (
    <div
      className={cn(
        "max-w-3xl mb-8 sm:mb-12",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 mb-3 flex-wrap",
          align === "center" ? "justify-center" : "justify-start"
        )}
      >
        {tag && (
          <span
            className={cn(
              "text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full border shadow-2xs",
              tagColor
            )}
          >
            {tag}
          </span>
        )}
        {badgeContent}
      </div>

      <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-bold text-stone-900 tracking-tight leading-tight">
        {title}
      </h2>

      {description && (
        <p className="mt-2.5 text-sm sm:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};
