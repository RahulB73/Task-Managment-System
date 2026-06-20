"use client";

import { useTransition } from "react";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import { updateTaskStatusAction } from "@/lib/tasks/actions";
import type { TaskStatus, Workspace } from "@/lib/types/app";
import { cn } from "@/lib/utils/cn";

type TaskStatusSelectProps = {
  workspace: Workspace;
  taskId: string;
  status: TaskStatus;
  compact?: boolean;
  className?: string;
};

export function TaskStatusSelect({
  workspace,
  taskId,
  status,
  compact = false,
  className,
}: TaskStatusSelectProps) {
  const [pending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value as TaskStatus;

    if (nextStatus === status) {
      return;
    }

    startTransition(async () => {
      await updateTaskStatusAction(workspace, taskId, nextStatus);
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={handleChange}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      aria-label="Change task status"
      className={cn(
        "rounded-lg border border-border bg-background text-foreground outline-none",
        "motion-safe:transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
        "disabled:cursor-wait disabled:opacity-60",
        compact ? "max-w-[9.5rem] px-2 py-1 text-xs" : "w-full max-w-[11rem] px-2.5 py-1.5 text-xs sm:text-sm",
        className
      )}
    >
      {TASK_STATUSES.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
