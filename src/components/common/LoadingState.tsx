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
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <TrustEmblem size="sm" showRibbonTab={false} className="mb-3" />
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-100 border-t-emerald-700 animate-spin" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
