import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TASK_STATUSES, isTaskStatus } from "@/lib/constants/task-status";
import type { TaskStatus } from "@/lib/types/app";
import type { Workspace } from "@/lib/types/app";

export type TaskListSearchParams = {
  search?: string;
  category?: string;
  status?: string;
  month?: string;
};

type TaskFiltersProps = {
  workspace: Workspace;
  params: TaskListSearchParams;
};

export function TaskFilters({ workspace, params }: TaskFiltersProps) {
  const monthValue = params.month?.slice(0, 7) ?? "";

  return (
    <form
      method="GET"
      className="grid gap-2.5 rounded-xl border border-border bg-card p-3 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-md sm:gap-3 sm:p-4 lg:grid-cols-4"
    >
      {params.category ? (
        <input type="hidden" name="category" value={params.category} />
      ) : null}

      <Input
        name="search"
        placeholder="Search tasks..."
        defaultValue={params.search ?? ""}
        className="sm:col-span-2"
      />

      <select
        name="status"
        defaultValue={params.status ?? ""}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none motion-safe:transition-all motion-safe:duration-200 hover:border-border-muted focus:border-primary focus:ring-2 focus:ring-primary/30 sm:px-4 sm:py-3"
      >
        <option value="">All statuses</option>
        {TASK_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <input
        type="month"
        name="month"
        defaultValue={monthValue}
        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none motion-safe:transition-all motion-safe:duration-200 hover:border-border-muted focus:border-primary focus:ring-2 focus:ring-primary/30 sm:px-4 sm:py-3"
      />

      <div className="flex flex-col gap-2 sm:flex-row lg:col-span-4">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        <Link href={params.category ? `/${workspace}?category=${encodeURIComponent(params.category)}` : `/${workspace}`}>
          <Button type="button" variant="secondary" size="sm">
            Clear filters
          </Button>
        </Link>
      </div>
    </form>
  );
}

export function parseTaskFilters(params: TaskListSearchParams) {
  const status = isTaskStatus(params.status) ? (params.status as TaskStatus) : undefined;

  const month = params.month
    ? `${params.month.slice(0, 7)}-01`
    : undefined;

  return {
    search: params.search?.trim() || undefined,
    category: params.category?.trim() || undefined,
    status,
    month,
  };
}
