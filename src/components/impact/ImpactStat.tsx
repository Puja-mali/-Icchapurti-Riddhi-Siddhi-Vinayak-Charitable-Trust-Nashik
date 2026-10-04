import React from "react";
import * as LucideIcons from "lucide-react";
import { AnimatedCounter } from "../common/AnimatedCounter";
import { cn } from "@/src/lib/utils";

interface ImpactStatProps {
  label: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  sublabel: string;
  iconName: string;
  className?: string;
}

export const ImpactStat: React.FC<ImpactStatProps> = ({
  label,
  numericValue,
  prefix = "",
  suffix = "",
  sublabel,
  iconName,
  className,
}) => {
  // Safe dynamic icon resolution
  const IconComponent =
    (LucideIcons as Record<string, any>)[iconName] || LucideIcons.Activity;

  return (
    <div
      className={cn(
        "relative bg-white rounded-md p-5 sm:p-6 border border-stone-200/90 shadow-2xs hover:border-stone-400 hover:shadow-xs transition-all duration-200 group flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded bg-[#faf0f1] text-[#7b1824] flex items-center justify-center border border-[#7b1824]/20 group-hover:bg-[#f6e4e6] transition-colors">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          <AnimatedCounter
            value={numericValue}
            prefix={prefix}
            suffix={suffix}
          />
        </div>
        <div className="text-sm font-serif font-bold text-stone-900 mt-1">{label}</div>
        <div className="text-xs text-stone-500 mt-1 leading-normal">{sublabel}</div>
      </div>
    </div>
  );
};
