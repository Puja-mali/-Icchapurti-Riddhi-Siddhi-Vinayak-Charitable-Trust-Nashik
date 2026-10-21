import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/src/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm px-4 py-2 gap-2",
      lg: "text-sm sm:text-base px-5 py-2.5 gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-[#14532d] text-white hover:bg-[#0f4023] shadow-2xs focus-visible:ring-[#14532d] active:bg-[#0a2f19]",
      secondary:
        "bg-stone-800 text-white hover:bg-stone-900 shadow-2xs focus-visible:ring-stone-800",
      outline:
        "border border-stone-300 text-stone-800 bg-white hover:bg-[#faf8f5] hover:border-stone-400 hover:text-stone-900 focus-visible:ring-[#14532d]",
      ghost:
        "text-stone-700 hover:text-stone-950 hover:bg-stone-100 focus-visible:ring-stone-400",
      danger:
        "bg-rose-700 text-white hover:bg-rose-800 shadow-2xs focus-visible:ring-rose-700",
    };

    const isInteractive = !disabled && !isLoading;

    return (
      <motion.button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        disabled={disabled || isLoading}
        whileHover={isInteractive && !shouldReduceMotion ? { scale: 1.02 } : undefined}
        whileTap={isInteractive && !shouldReduceMotion ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.15, ease: "easeOut" }}
        {...(props as any)}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
