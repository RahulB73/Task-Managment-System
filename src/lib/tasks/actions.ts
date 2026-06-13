"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createTask, deleteTask, updateTask } from "@/lib/db/tasks";
import {
  createSubtask,
  deleteSubtask,
  getNextSubtaskSortOrder,
  updateSubtask,
} from "@/lib/db/subtasks";
import { createReview, deleteReview } from "@/lib/db/reviews";
import {
  createMonthlyEntry,
  deleteMonthlyEntry,
  getNextMonthlyEntrySortOrder,
} from "@/lib/db/monthly";
import type { SubtaskStatus, TaskStatus, Workspace } from "@/lib/types/app";

export type ActionState = {
  error?: string;
  success?: string;
};

function revalidateTaskPaths(workspace: Workspace, taskId: string) {
  revalidatePath(`/${workspace}/${taskId}`);
  revalidatePath(`/${workspace}`);
  revalidatePath("/");
  revalidatePath("/monthly");
}

function revalidateWorkspacePaths(workspace: Workspace) {
  revalidatePath(`/${workspace}`);
  revalidatePath("/");
  revalidatePath("/monthly");
}

export async function createTaskAction(
  workspace: Workspace,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();
  const expectedResult = String(formData.get("expected_result") ?? "").trim();
  const timelineStart = String(formData.get("timeline_start") ?? "").trim();
  const timelineEnd = String(formData.get("timeline_end") ?? "").trim();
  const status = String(formData.get("status") ?? "in_progress") as TaskStatus;
  const category = String(formData.get("category") ?? "").trim();

  if (!title) {
    return { error: "Title is required." };
  }

  let task;

  try {
    task = await createTask({
      workspace,
      title,
      purpose: purpose || null,
      expected_result: expectedResult || null,
      timeline_start: timelineStart || null,
      timeline_end: timelineEnd || null,
      status,
      category: category || null,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create task.",
    };
  }

  revalidateWorkspacePaths(workspace);
  redirect(`/${workspace}/${task.id}`);
}

export async function deleteTaskAction(workspace: Workspace, taskId: string) {
  try {
    await deleteTask(taskId);
    revalidateWorkspacePaths(workspace);
    redirect(`/${workspace}`);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to delete task.");
  }
}

export async function updateTaskDetails(
  workspace: Workspace,
  taskId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const title = String(formData.get("title") ?? "").trim();
    const purpose = String(formData.get("purpose") ?? "").trim();
    const expectedResult = String(formData.get("expected_result") ?? "").trim();
    const timelineStart = String(formData.get("timeline_start") ?? "").trim();
    const timelineEnd = String(formData.get("timeline_end") ?? "").trim();
    const status = String(formData.get("status") ?? "pending") as TaskStatus;
    const category = String(formData.get("category") ?? "").trim();

    if (!title) {
      return { error: "Title is required." };
    }

    await updateTask(taskId, {
      title,
      purpose: purpose || null,
      expected_result: expectedResult || null,
      timeline_start: timelineStart || null,
      timeline_end: timelineEnd || null,
      status,
      category: category || null,
    });

    revalidateTaskPaths(workspace, taskId);
    return { success: "Task updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update task.",
    };
  }
}

export async function addSubtaskAction(
  workspace: Workspace,
  taskId: string,
  formData: FormData
): Promise<ActionState> {
  try {
    const title = String(formData.get("title") ?? "").trim();
    const parentSubtaskId = String(formData.get("parent_subtask_id") ?? "").trim();

    if (!title) {
      return { error: "Subtask title is required." };
    }

    const sortOrder = await getNextSubtaskSortOrder(
      taskId,
      parentSubtaskId || null
    );

    await createSubtask({
      task_id: taskId,
      parent_subtask_id: parentSubtaskId || null,
      title,
      sort_order: sortOrder,
    });

    revalidateTaskPaths(workspace, taskId);
    return { success: "Subtask added." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add subtask.",
    };
  }
}

export async function toggleSubtaskStatusAction(
  workspace: Workspace,
  taskId: string,
  subtaskId: string,
  currentStatus: SubtaskStatus
) {
  try {
    const nextStatus = currentStatus === "done" ? "pending" : "done";
    await updateSubtask(subtaskId, { status: nextStatus });
    revalidateTaskPaths(workspace, taskId);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to update subtask.");
  }
}

export async function deleteSubtaskAction(
  workspace: Workspace,
  taskId: string,
  subtaskId: string
) {
  try {
    await deleteSubtask(subtaskId);
    revalidateTaskPaths(workspace, taskId);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to delete subtask.");
  }
}

export async function addReviewAction(
  workspace: Workspace,
  taskId: string,
  formData: FormData
): Promise<ActionState> {
  try {
    const comment = String(formData.get("comment") ?? "").trim();
    const reviewDate = String(formData.get("review_date") ?? "").trim();
    const subtaskId = String(formData.get("subtask_id") ?? "").trim();

    if (!comment) {
      return { error: "Review comment is required." };
    }

    await createReview({
      task_id: taskId,
      comment,
      review_date: reviewDate || new Date().toISOString().slice(0, 10),
      subtask_id: subtaskId || null,
    });

    revalidateTaskPaths(workspace, taskId);
    return { success: "Review added." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add review.",
    };
  }
}

export async function deleteReviewAction(
  workspace: Workspace,
  taskId: string,
  reviewId: string
) {
  try {
    await deleteReview(reviewId);
    revalidateTaskPaths(workspace, taskId);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to delete review.");
  }
}

export async function addMonthlyEntryAction(
  month: string,
  formData: FormData
): Promise<ActionState> {
  try {
    const type = String(formData.get("type") ?? "") as "win" | "focus";
    const content = String(formData.get("content") ?? "").trim();
    const taskId = String(formData.get("task_id") ?? "").trim();

    if (!content) {
      return { error: "Content is required." };
    }

    if (type !== "win" && type !== "focus") {
      return { error: "Invalid entry type." };
    }

    const sortOrder = await getNextMonthlyEntrySortOrder(month, type);

    await createMonthlyEntry({
      month,
      type,
      content,
      task_id: taskId || null,
      sort_order: sortOrder,
    });

    revalidatePath("/monthly");
    return { success: "Entry added." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to add entry.",
    };
  }
}

export async function deleteMonthlyEntryAction(entryId: string) {
  try {
    await deleteMonthlyEntry(entryId);
    revalidatePath("/monthly");
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to delete entry.");
  }
}
