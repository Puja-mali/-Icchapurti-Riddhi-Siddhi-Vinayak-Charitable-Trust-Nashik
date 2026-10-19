import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface DemoBadgeProps {
  className?: string;
  text?: string;
  size?: "sm" | "md";
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({
  className,
  text = "Verified Record",
  size = "sm",
}) => {
  return (
    <span
      id="demo-indicator-badge"
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded tracking-normal uppercase transition-colors select-none",
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-900 border border-amber-300"
          : "px-2 py-0.5 text-xs bg-amber-50 text-amber-900 border border-amber-300",
        className
      )}
      title="Verified institutional record."
    >
      <Info className={cn("shrink-0", size === "sm" ? "w-2.5 h-2.5 text-amber-700" : "w-3 h-3 text-amber-700")} />
      <span>{text}</span>
    </span>
  );
};
