/** Shared motion class strings — use with cn() */
export const motion = {
  card:
    "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-border-muted motion-safe:hover:shadow-xl motion-safe:hover:shadow-black/30 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.995]",
  row:
    "motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:border-border motion-safe:hover:bg-background/70 motion-safe:hover:shadow-sm motion-safe:active:scale-[0.99]",
  navItem:
    "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:translate-x-0.5 motion-safe:active:scale-[0.98]",
  navItemActive:
    "motion-safe:transition-all motion-safe:duration-200 motion-safe:shadow-md motion-safe:shadow-primary/20",
  link: "motion-safe:transition-colors motion-safe:duration-200 hover:text-accent",
  iconBtn:
    "motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-out motion-safe:hover:scale-110 motion-safe:active:scale-95",
  fadeIn: "animate-fade-in",
} as const;
