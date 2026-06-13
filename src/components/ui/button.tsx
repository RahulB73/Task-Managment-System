import { cn } from "@/lib/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 disabled:hover:bg-primary disabled:hover:shadow-md",
  secondary:
    "border border-border bg-card text-foreground shadow-sm hover:border-border-muted hover:bg-card-hover hover:shadow-md hover:shadow-black/20",
  ghost:
    "text-muted hover:bg-card hover:text-foreground hover:shadow-sm",
  danger:
    "border border-danger/30 bg-danger/10 text-danger hover:border-danger/50 hover:bg-danger/20 hover:shadow-md hover:shadow-danger/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium",
          "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out",
          "motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
