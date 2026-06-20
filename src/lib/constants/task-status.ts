import type { TaskStatus } from "@/lib/types/app";

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_testing", label: "In Testing / Review" },
  { value: "done", label: "Done" },
  { value: "paused", label: "Paused" },
];

export const TASK_STATUS_VALUES = TASK_STATUSES.map((status) => status.value);

export function isTaskStatus(value: string | undefined): value is TaskStatus {
  return TASK_STATUS_VALUES.includes(value as TaskStatus);
}
