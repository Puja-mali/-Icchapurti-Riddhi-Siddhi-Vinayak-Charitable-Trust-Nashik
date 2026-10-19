import React from "react";
import { cn } from "@/src/lib/utils";
import { TrustEmblem } from "./TrustEmblem";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading verified trust records...",
  className,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <TrustEmblem size="md" showRibbonTab={false} className="mb-4" />
      <div className="relative w-11 h-11">
        <div className="w-11 h-11 rounded-full border-3 border-emerald-100 border-t-emerald-700 animate-spin" />
      </div>
      <p className="mt-3 text-base font-semibold text-stone-800">{message}</p>
    </div>
  );
};
