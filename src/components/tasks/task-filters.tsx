import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TaskStatus } from "@/lib/types/app";
import type { Workspace } from "@/lib/types/app";

const STATUSES: TaskStatus[] = ["pending", "in_progress", "done", "paused"];

export type TaskListSearchParams = {
  search?: string;
  category?: string;
  status?: string;
  month?: string;
};

type TaskFiltersProps = {
  workspace: Workspace;
  categories: string[];
  params: TaskListSearchParams;
};

export function TaskFilters({ workspace, categories, params }: TaskFiltersProps) {
  const monthValue = params.month?.slice(0, 7) ?? "";

  return (
    <form
      method="GET"
      className="grid gap-3 rounded-xl border border-border bg-card p-4 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-md sm:grid-cols-2 xl:grid-cols-5"
    >
      <Input
        name="search"
        placeholder="Search tasks..."
        defaultValue={params.search ?? ""}
        className="lg:col-span-2"
      />

      <select
        name="category"
        defaultValue={params.category ?? ""}
        className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none motion-safe:transition-all motion-safe:duration-200 hover:border-border-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        name="status"
        defaultValue={params.status ?? ""}
        className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none motion-safe:transition-all motion-safe:duration-200 hover:border-border-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        <option value="">All statuses</option>
        {STATUSES.map((status) => (
          <option key={status} value={status}>
            {status.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <input
        type="month"
        name="month"
        defaultValue={monthValue}
        className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none motion-safe:transition-all motion-safe:duration-200 hover:border-border-muted focus:border-primary focus:ring-2 focus:ring-primary/30"
      />

      <div className="flex flex-col gap-2 sm:flex-row xl:col-span-5">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        <Link href={`/${workspace}`}>
          <Button type="button" variant="secondary" size="sm">
            Clear
          </Button>
        </Link>
      </div>
    </form>
  );
}

export function parseTaskFilters(params: TaskListSearchParams) {
  const status = STATUSES.includes(params.status as TaskStatus)
    ? (params.status as TaskStatus)
    : undefined;

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
