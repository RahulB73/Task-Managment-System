import { cn } from "@/lib/utils/cn";

type ProgressBarProps = {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md";
};

export function ProgressBar({
  value,
  className,
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>Progress</span>
          <span className="font-medium text-foreground">{clamped}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-background",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
