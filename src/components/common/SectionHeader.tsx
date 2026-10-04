import React from "react";
import { cn } from "@/src/lib/utils";

interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  badgeContent?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  tag,
  title,
  description,
  align = "center",
  className,
  badgeContent,
}) => {
  return (
    <div
      className={cn(
        "max-w-3xl mb-10 md:mb-14",
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
          <span className="text-xs font-semibold tracking-wider uppercase text-[#7b1824] bg-[#fbf0f1] px-2.5 py-0.5 rounded border border-[#7b1824]/20">
            {tag}
          </span>
        )}
        {badgeContent}
      </div>

      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
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
