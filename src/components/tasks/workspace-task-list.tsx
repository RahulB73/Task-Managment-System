import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskActionsMenu } from "@/components/tasks/task-actions-menu";
import {
  TaskFilters,
  parseTaskFilters,
  type TaskListSearchParams,
} from "@/components/tasks/task-filters";
import { getTasksWithProgress } from "@/lib/db/queries";
import { getTaskCategories } from "@/lib/db/tasks";
import { formatTimelineDate } from "@/lib/progress";
import type { Workspace } from "@/lib/types/app";
import type { TaskListItem } from "@/lib/db/queries";

type WorkspaceTaskListProps = {
  workspace: Workspace;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  itemLabel: string;
  searchParams: TaskListSearchParams;
};

export async function WorkspaceTaskList({
  workspace,
  title,
  description,
  emptyTitle,
  emptyDescription,
  itemLabel,
  searchParams,
}: WorkspaceTaskListProps) {
  const filters = parseTaskFilters(searchParams);

  const [tasks, categories] = await Promise.all([
    getTasksWithProgress(workspace, filters),
    getTaskCategories(workspace),
  ]);

  const hasFilters = Boolean(
    filters.search || filters.category || filters.status || filters.month
  );

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={<CreateTaskForm workspace={workspace} itemLabel={itemLabel} />}
      />

      <div className="flex flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 animate-fade-in">
        <TaskFilters
          workspace={workspace}
          categories={categories}
          params={searchParams}
        />

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium text-foreground">
                {hasFilters ? "No matching items" : emptyTitle}
              </p>
              <p className="mt-2 text-sm text-muted">
                {hasFilters
                  ? "Try clearing filters or adjusting your search."
                  : emptyDescription}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} workspace={workspace} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TaskCard({
  task,
  workspace,
}: {
  task: TaskListItem;
  workspace: Workspace;
}) {
  return (
    <Card interactive className="transition hover:border-primary/30 hover:bg-card-hover">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{task.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              {task.category && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-accent">
                  {task.category}
                </span>
              )}
              <span>Due {formatTimelineDate(task.timeline_end)}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant={task.status} />
            <TaskActionsMenu
              workspace={workspace}
              taskId={task.id}
              taskTitle={task.title}
            />
          </div>
        </div>
        <ProgressBar value={task.progress} showLabel />
        <div className="flex justify-end">
          <Link href={`/${workspace}/${task.id}`}>
            <Button size="sm">View</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
