import { WorkspaceTaskList } from "@/components/tasks/workspace-task-list";
import type { TaskListSearchParams } from "@/components/tasks/task-filters";

export default async function OfficePage({
  searchParams,
}: {
  searchParams: Promise<TaskListSearchParams>;
}) {
  const params = await searchParams;

  return (
    <WorkspaceTaskList
      workspace="office"
      title="Office Tasks"
      description="Work tasks and deliverables."
      emptyTitle="No office tasks yet"
      emptyDescription="Create your first office task to get started."
      itemLabel="Task"
      searchParams={params}
    />
  );
}
