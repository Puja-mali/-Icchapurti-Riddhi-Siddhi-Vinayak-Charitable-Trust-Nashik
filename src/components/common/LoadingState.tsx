import React from "react";
import { cn } from "@/src/lib/utils";

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
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-100 border-t-emerald-700 animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
