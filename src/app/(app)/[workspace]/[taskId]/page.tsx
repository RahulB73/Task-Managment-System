import { notFound } from "next/navigation";
import { getTaskDetail } from "@/lib/db/queries";
import { TaskDetailView } from "@/components/tasks/task-detail-view";
import { isWorkspace } from "@/lib/utils/workspace";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; taskId: string }>;
}) {
  const { workspace, taskId } = await params;

  if (!isWorkspace(workspace)) {
    notFound();
  }

  const detail = await getTaskDetail(taskId);

  if (!detail || detail.task.workspace !== workspace) {
    notFound();
  }

  return <TaskDetailView workspace={workspace} detail={detail} />;
}
