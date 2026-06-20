import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { CopyTasksExcelButton } from "@/components/tasks/copy-tasks-excel-button";
import {
  CategoryFilterBar,
  groupTasksByCategory,
} from "@/components/tasks/category-filter-bar";
import { SortableTaskTable } from "@/components/tasks/sortable-task-table";
import {
  TaskFilters,
  parseTaskFilters,
  type TaskListSearchParams,
} from "@/components/tasks/task-filters";
import { getTasksWithProgress, getTodayTasksWithProgress } from "@/lib/db/queries";
import { getWorkspaceCategoryMeta } from "@/lib/db/tasks";
import { todayDateString } from "@/lib/export/tasks-to-excel";
import type { Workspace } from "@/lib/types/app";

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
  const activeCategory = filters.category;
  const reportDate = todayDateString();

  const [tasks, categoryMeta, todayOfficeTasks] = await Promise.all([
    getTasksWithProgress(workspace, filters),
    getWorkspaceCategoryMeta(workspace),
    workspace === "office"
      ? getTodayTasksWithProgress(reportDate).then((items) =>
          items.filter((task) => task.workspace === "office")
        )
      : Promise.resolve([]),
  ]);

  const hasSecondaryFilters = Boolean(
    filters.search || filters.status || filters.month
  );

  const groupedTasks = groupTasksByCategory(tasks);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {workspace === "office" && (
              <CopyTasksExcelButton
                tasks={todayOfficeTasks}
                reportDate={reportDate}
                label="Copy today for Excel"
              />
            )}
            <CreateTaskForm workspace={workspace} itemLabel={itemLabel} />
          </div>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 animate-fade-in">
        <CategoryFilterBar
          workspace={workspace}
          categories={categoryMeta.categories}
          hasUncategorized={categoryMeta.hasUncategorized}
          activeCategory={activeCategory}
          params={searchParams}
        />

        <TaskFilters workspace={workspace} params={searchParams} />

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium text-foreground">
                {hasSecondaryFilters || activeCategory
                  ? "No matching items"
                  : emptyTitle}
              </p>
              <p className="mt-2 text-sm text-muted">
                {hasSecondaryFilters || activeCategory
                  ? "Try clearing filters or choosing another category."
                  : emptyDescription}
              </p>
            </CardContent>
          </Card>
        ) : activeCategory ? (
          <SortableTaskTable
            workspace={workspace}
            tasks={tasks}
            dndId={`${workspace}-${activeCategory}`}
          />
        ) : (
          <div className="space-y-5 sm:space-y-8">
            {groupedTasks.map((group) => (
              <SortableTaskTable
                key={group.key}
                workspace={workspace}
                tasks={group.tasks}
                sectionTitle={group.label}
                dndId={`${workspace}-${group.key}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
