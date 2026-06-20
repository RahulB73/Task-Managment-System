import Link from "next/link";
import {
  categoryFilterLabel,
  UNCATEGORIZED_CATEGORY,
} from "@/lib/constants/categories";
import { cn } from "@/lib/utils/cn";
import type { Workspace } from "@/lib/types/app";
import type { TaskListSearchParams } from "@/components/tasks/task-filters";

type CategoryFilterBarProps = {
  workspace: Workspace;
  categories: string[];
  hasUncategorized: boolean;
  activeCategory?: string;
  params: TaskListSearchParams;
};

function buildCategoryHref(
  workspace: Workspace,
  category: string | undefined,
  params: TaskListSearchParams
) {
  const searchParams = new URLSearchParams();

  if (category) {
    searchParams.set("category", category);
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status?.trim()) {
    searchParams.set("status", params.status.trim());
  }

  if (params.month?.trim()) {
    searchParams.set("month", params.month.trim());
  }

  const query = searchParams.toString();
  return query ? `/${workspace}?${query}` : `/${workspace}`;
}

function CategoryChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 snap-start items-center rounded-full border px-3 py-2 text-sm font-medium touch-manipulation motion-safe:transition-all motion-safe:duration-200",
        active
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-border bg-card text-muted hover:border-primary/40 hover:bg-card-hover hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export function CategoryFilterBar({
  workspace,
  categories,
  hasUncategorized,
  activeCategory,
  params,
}: CategoryFilterBarProps) {
  const isAllActive = !activeCategory;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        Categories
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-thin">
        <CategoryChip
          href={buildCategoryHref(workspace, undefined, params)}
          label="All"
          active={isAllActive}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category}
            href={buildCategoryHref(workspace, category, params)}
            label={categoryFilterLabel(category)}
            active={activeCategory === category}
          />
        ))}
        {hasUncategorized && (
          <CategoryChip
            href={buildCategoryHref(workspace, UNCATEGORIZED_CATEGORY, params)}
            label="Uncategorized"
            active={activeCategory === UNCATEGORIZED_CATEGORY}
          />
        )}
      </div>
    </div>
  );
}

export function groupTasksByCategory<T extends { category: string | null }>(
  tasks: T[]
): Array<{ key: string; label: string; tasks: T[] }> {
  const groups = new Map<string, { label: string; tasks: T[] }>();

  for (const task of tasks) {
    const key = task.category ?? UNCATEGORIZED_CATEGORY;
    const label = task.category ?? "Uncategorized";
    const existing = groups.get(key);

    if (existing) {
      existing.tasks.push(task);
    } else {
      groups.set(key, { label, tasks: [task] });
    }
  }

  return [...groups.entries()]
    .sort(([keyA], [keyB]) => {
      if (keyA === UNCATEGORIZED_CATEGORY) {
        return 1;
      }

      if (keyB === UNCATEGORIZED_CATEGORY) {
        return -1;
      }

      return keyA.localeCompare(keyB);
    })
    .map(([key, value]) => ({ key, ...value }));
}
