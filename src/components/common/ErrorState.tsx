import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/src/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again or check back later.",
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-6 sm:p-8 rounded-xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-base font-semibold text-rose-950">{title}</h4>
      <p className="text-sm text-rose-800/80 mt-1">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="mt-4 bg-white border-rose-300 text-rose-900 hover:bg-rose-50"
        >
          Retry Action
        </Button>
      )}
    </div>
  );
};
