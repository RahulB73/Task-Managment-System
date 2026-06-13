import { getTasks, getTask } from "@/lib/db/tasks";
import { getSubtasksByTask, getSubtasksByTaskIds } from "@/lib/db/subtasks";
import { getReviewsByTask } from "@/lib/db/reviews";
import {
  buildSubtaskTree,
  calculateProgressFromSubtasks,
} from "@/lib/progress";
import type { Review } from "@/lib/types/database";
import type { Task } from "@/lib/types/database";
import type { TaskFilters, Workspace } from "@/lib/db/types";
import type { SubtaskNode } from "@/lib/progress";

export type TaskListItem = Task & {
  progress: number;
};

export async function getTasksWithProgress(
  workspace: Workspace,
  filters?: TaskFilters
): Promise<TaskListItem[]> {
  const tasks = await getTasks(workspace, filters);

  if (tasks.length === 0) {
    return [];
  }

  const subtasks = await getSubtasksByTaskIds(tasks.map((task) => task.id));
  const subtasksByTask = new Map<string, typeof subtasks>();

  for (const subtask of subtasks) {
    const existing = subtasksByTask.get(subtask.task_id) ?? [];
    existing.push(subtask);
    subtasksByTask.set(subtask.task_id, existing);
  }

  return tasks.map((task) => ({
    ...task,
    progress: calculateProgressFromSubtasks(subtasksByTask.get(task.id) ?? []),
  }));
}

export async function getTaskWithProgress(
  taskId: string
): Promise<TaskListItem | null> {
  const task = await getTask(taskId);

  if (!task) {
    return null;
  }

  const subtasks = await getSubtasksByTask(taskId);

  return {
    ...task,
    progress: calculateProgressFromSubtasks(subtasks),
  };
}

export type TaskDetail = {
  task: TaskListItem;
  subtaskTree: SubtaskNode[];
  reviews: Review[];
};

export async function getTaskDetail(taskId: string): Promise<TaskDetail | null> {
  const task = await getTask(taskId);

  if (!task) {
    return null;
  }

  const [subtasks, reviews] = await Promise.all([
    getSubtasksByTask(taskId),
    getReviewsByTask(taskId),
  ]);

  return {
    task: {
      ...task,
      progress: calculateProgressFromSubtasks(subtasks),
    },
    subtaskTree: buildSubtaskTree(subtasks),
    reviews,
  };
}

function averageProgress(tasks: Array<{ progress: number }>) {
  if (tasks.length === 0) {
    return 0;
  }

  const total = tasks.reduce((sum, task) => sum + task.progress, 0);
  return Math.round(total / tasks.length);
}

export type MonthlyDashboardData = {
  monthStart: string;
  monthLabel: string;
  nextMonthLabel: string;
  overallProgress: number;
  completed: number;
  pending: number;
  overdue: number;
  officeProgress: number;
  personalProgress: number;
  officeCompleted: number;
  personalCompleted: number;
  officePending: number;
  personalPending: number;
  officeTasks: TaskListItem[];
  personalTasks: TaskListItem[];
  allTasks: TaskListItem[];
};

export async function getMonthlyDashboardData(
  monthInput?: string
): Promise<MonthlyDashboardData> {
  const baseDate = monthInput
    ? new Date(`${monthInput.slice(0, 7)}-01T00:00:00`)
    : new Date();

  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const nextMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1);

  const [officeTasks, personalTasks] = await Promise.all([
    getTasksWithProgress("office"),
    getTasksWithProgress("personal"),
  ]);

  const allTasks = [...officeTasks, ...personalTasks];
  const today = new Date().toISOString().slice(0, 10);

  const completed = allTasks.filter((task) => task.status === "done").length;
  const pending = allTasks.length - completed;
  const overdue = allTasks.filter(
    (task) =>
      task.status !== "done" &&
      task.timeline_end &&
      task.timeline_end < today
  ).length;

  return {
    monthStart,
    monthLabel: baseDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    nextMonthLabel: nextMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    overallProgress: averageProgress(allTasks),
    completed,
    pending,
    overdue,
    officeProgress: averageProgress(officeTasks),
    personalProgress: averageProgress(personalTasks),
    officeCompleted: officeTasks.filter((task) => task.status === "done").length,
    personalCompleted: personalTasks.filter((task) => task.status === "done")
      .length,
    officePending: officeTasks.length - officeTasks.filter((t) => t.status === "done").length,
    personalPending:
      personalTasks.length -
      personalTasks.filter((task) => task.status === "done").length,
    officeTasks,
    personalTasks,
    allTasks,
  };
}
