import { cn } from "@/lib/utils/cn";
import type { TaskStatus } from "@/lib/types/app";

type BadgeVariant =
  | TaskStatus
  | "default"
  | "high"
  | "medium"
  | "low";

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-border bg-background text-muted",
  pending: "border-warning/30 bg-warning/10 text-warning",
  in_progress: "border-primary/30 bg-primary/10 text-accent",
  in_testing: "border-warning/30 bg-warning/15 text-warning",
  done: "border-success/30 bg-success/10 text-success",
  paused: "border-border-muted bg-card text-muted",
  high: "border-danger/30 bg-danger/10 text-danger",
  medium: "border-warning/30 bg-warning/10 text-warning",
  low: "border-border-muted bg-card text-muted",
};

const labelMap: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  in_testing: "In Testing / Review",
  done: "Done",
  paused: "Paused",
  high: "High",
  medium: "Medium",
  low: "Low",
  default: "Default",
};

type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
};

export function Badge({
  variant = "default",
  className,
  children,
}: BadgeProps) {
  const label =
    children ??
    labelMap[variant] ??
    String(variant).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        variantStyles[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
