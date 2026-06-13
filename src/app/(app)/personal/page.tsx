import { WorkspaceTaskList } from "@/components/tasks/workspace-task-list";
import type { TaskListSearchParams } from "@/components/tasks/task-filters";

export default async function PersonalPage({
  searchParams,
}: {
  searchParams: Promise<TaskListSearchParams>;
}) {
  const params = await searchParams;

  return (
    <WorkspaceTaskList
      workspace="personal"
      title="Personal Goals"
      description="Long-term goals and learning paths."
      emptyTitle="No personal goals yet"
      emptyDescription="Create your first goal to get started."
      itemLabel="Goal"
      searchParams={params}
    />
  );
}
