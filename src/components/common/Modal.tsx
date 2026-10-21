import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || "";
      document.body.style.paddingRight = originalPaddingRight || "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalElement = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-stone-950/75 backdrop-blur-xs flex min-h-screen items-center justify-center p-3 sm:p-6"
      role="presentation"
    >
      {/* Backdrop click listener */}
      <div
        className="fixed inset-0 -z-10 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-10 m-auto flex flex-col max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-4rem)] animate-in fade-in zoom-in-95 duration-200 outline-none",
          sizeClasses[size],
          className
        )}
      >
        {/* Header (sticky to top of modal card, shrink-0) */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-stone-100 bg-stone-50/90 shrink-0">
          <div className="pr-3">
            <h3 id="modal-title" className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0 cursor-pointer touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content with internal smooth scrolling */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 text-stone-800">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalElement, document.body)
    : modalElement;
};
