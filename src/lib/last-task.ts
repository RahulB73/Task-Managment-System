import type { Workspace } from "@/lib/types/app";

export const LAST_TASK_COOKIE = "taskflow-last-task";

export type LastTaskCookie = {
  workspace: Workspace;
  taskId: string;
  title: string;
};

export function serializeLastTask(data: LastTaskCookie): string {
  return `${data.workspace}|${data.taskId}|${encodeURIComponent(data.title)}`;
}

export function parseLastTask(value: string | undefined): LastTaskCookie | null {
  if (!value) {
    return null;
  }

  const [workspace, taskId, encodedTitle] = value.split("|");

  if (
    (workspace !== "office" && workspace !== "personal") ||
    !taskId ||
    !encodedTitle
  ) {
    return null;
  }

  return {
    workspace,
    taskId,
    title: decodeURIComponent(encodedTitle),
  };
}
