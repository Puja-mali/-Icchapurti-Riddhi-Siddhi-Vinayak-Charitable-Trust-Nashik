import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/src/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void | Promise<void> | unknown;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No records found",
  description = "There are no entries matching your filter criteria at this moment.",
  actionText,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  const effectiveActionText = actionLabel || actionText;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
        {icon || <FolderOpen className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      {effectiveActionText && onAction && (
        <Button size="sm" variant="outline" onClick={onAction} className="mt-4">
          {effectiveActionText}
        </Button>
      )}
    </div>
  );
};
