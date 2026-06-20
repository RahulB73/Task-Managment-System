import { TASK_STATUSES } from "@/lib/constants/task-status";
import type { TaskListItem } from "@/lib/db/queries";
import type { TaskStatus } from "@/lib/types/app";

const HEADERS = [
  "Date",
  "Priority",
  "Task",
  "Client",
  "Deadline Date",
  "Status",
] as const;

function formatReportDate(date: string): string {
  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDeadlineDate(date: string | null): string {
  if (!date) {
    return "";
  }

  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: TaskStatus): string {
  return TASK_STATUSES.find((item) => item.value === status)?.label ?? status;
}

function escapeCell(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

export function formatTasksForExcel(
  tasks: TaskListItem[],
  reportDate: string
): string {
  const rows = tasks.map((task, index) => [
    formatReportDate(reportDate),
    String(index + 1),
    task.title,
    task.category ?? "",
    formatDeadlineDate(task.timeline_end),
    statusLabel(task.status),
  ]);

  return [HEADERS, ...rows]
    .map((row) => row.map((cell) => escapeCell(String(cell))).join("\t"))
    .join("\n");
}

export function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}
