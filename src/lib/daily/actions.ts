"use server";

import { revalidatePath } from "next/cache";
import {
  addDailyPriority,
  getDailyPriorityTaskIds,
  getIncompleteDailyTaskIds,
  removeDailyPriority,
  reorderDailyPriorities,
} from "@/lib/db/daily";

function revalidateTodayPaths(date: string) {
  revalidatePath("/today");
  revalidatePath(`/today?date=${date.slice(0, 10)}`);
}

function previousDay(date: string): string {
  const d = new Date(`${date.slice(0, 10)}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
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

export async function carryOverYesterdayAction(
  date: string
): Promise<{ added: number }> {
  try {
    const priorityDate = date.slice(0, 10);
    const yesterday = previousDay(priorityDate);

    const [incompleteYesterdayIds, todayIds] = await Promise.all([
      getIncompleteDailyTaskIds(yesterday),
      getDailyPriorityTaskIds(priorityDate),
    ]);

    const todaySet = new Set(todayIds);
    const toAdd = incompleteYesterdayIds.filter((taskId) => !todaySet.has(taskId));

    for (const taskId of toAdd) {
      await addDailyPriority(priorityDate, taskId);
    }

    if (toAdd.length > 0) {
      revalidateTodayPaths(priorityDate);
    }

    return { added: toAdd.length };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to carry over yesterday's tasks.");
  }
}
