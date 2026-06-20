"use server";

import { revalidatePath } from "next/cache";
import {
  addDailyPriority,
  removeDailyPriority,
  reorderDailyPriorities,
} from "@/lib/db/daily";

function revalidateTodayPaths(date: string) {
  revalidatePath("/today");
  revalidatePath(`/today?date=${date.slice(0, 10)}`);
}

export async function addTaskToTodayAction(date: string, taskId: string) {
  try {
    await addDailyPriority(date, taskId);
    revalidateTodayPaths(date);
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to add task to today.");
  }
}

export async function removeTaskFromTodayAction(date: string, taskId: string) {
  try {
    await removeDailyPriority(date, taskId);
    revalidateTodayPaths(date);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to remove task from today.");
  }
}

export async function reorderTodayTasksAction(date: string, taskIds: string[]) {
  try {
    await reorderDailyPriorities(date, taskIds);
    revalidateTodayPaths(date);
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to reorder today's tasks.");
  }
}
