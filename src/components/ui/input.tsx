import { cn } from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, id, ...props },
  ref
) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted/70 outline-none",
          "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out",
          "hover:border-border-muted hover:shadow-sm",
          "focus:border-primary focus:ring-2 focus:ring-primary/30",
          error && "border-danger focus:border-danger focus:ring-danger",
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
});
