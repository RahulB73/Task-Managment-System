import { createClient } from "@/lib/supabase/server";
import { assertList, assertNoError, assertSingle } from "@/lib/db/utils";
import type { DailyPriority } from "@/lib/types/database";

function normalizeDate(date: string): string {
  return date.slice(0, 10);
}

export async function getDailyPriorities(date: string): Promise<DailyPriority[]> {
  const supabase = await createClient();
  const priorityDate = normalizeDate(date);

  const result = await supabase
    .from("daily_priorities")
    .select("*")
    .eq("priority_date", priorityDate)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return assertList("getDailyPriorities", result);
}

export async function getDailyPriorityTaskIds(date: string): Promise<string[]> {
  const rows = await getDailyPriorities(date);
  return rows.map((row) => row.task_id);
}

export async function addDailyPriority(
  date: string,
  taskId: string
): Promise<DailyPriority> {
  const supabase = await createClient();
  const priorityDate = normalizeDate(date);

  const taskResult = await supabase
    .from("tasks")
    .select("workspace")
    .eq("id", taskId)
    .single();

  if (taskResult.error || !taskResult.data) {
    throw new Error(`addDailyPriority: task not found`);
  }

  const sortOrder = await getNextDailySortOrder(
    priorityDate,
    taskResult.data.workspace
  );

  const result = await supabase
    .from("daily_priorities")
    .insert({
      priority_date: priorityDate,
      task_id: taskId,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  return assertSingle("addDailyPriority", result);
}

export async function removeDailyPriority(
  date: string,
  taskId: string
): Promise<void> {
  const supabase = await createClient();
  const priorityDate = normalizeDate(date);

  const result = await supabase
    .from("daily_priorities")
    .delete()
    .eq("priority_date", priorityDate)
    .eq("task_id", taskId);

  assertNoError("removeDailyPriority", { data: null, error: result.error });
}

export async function reorderDailyPriorities(
  date: string,
  taskIds: string[]
): Promise<void> {
  if (taskIds.length === 0) {
    return;
  }

  const supabase = await createClient();
  const priorityDate = normalizeDate(date);

  const updates = taskIds.map((taskId, index) =>
    supabase
      .from("daily_priorities")
      .update({ sort_order: index })
      .eq("priority_date", priorityDate)
      .eq("task_id", taskId)
  );

  const results = await Promise.all(updates);

  for (const result of results) {
    assertNoError("reorderDailyPriorities", { data: null, error: result.error });
  }
}

export async function getNextDailySortOrder(
  date: string,
  workspace: "office" | "personal"
): Promise<number> {
  const supabase = await createClient();
  const priorityDate = normalizeDate(date);
  const dailyRows = await getDailyPriorities(priorityDate);

  if (dailyRows.length === 0) {
    return 0;
  }

  const taskIds = dailyRows.map((row) => row.task_id);
  const tasksResult = await supabase
    .from("tasks")
    .select("id")
    .in("id", taskIds)
    .eq("workspace", workspace);

  if (tasksResult.error) {
    throw new Error(`getNextDailySortOrder: ${tasksResult.error.message}`);
  }

  const workspaceTaskIds = new Set((tasksResult.data ?? []).map((task) => task.id));
  let maxOrder = -1;

  for (const row of dailyRows) {
    if (workspaceTaskIds.has(row.task_id)) {
      maxOrder = Math.max(maxOrder, row.sort_order);
    }
  }

  return maxOrder + 1;
}
