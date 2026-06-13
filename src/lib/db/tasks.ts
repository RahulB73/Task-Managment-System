import { createClient } from "@/lib/supabase/server";
import { assertList, assertNoError, assertSingle } from "@/lib/db/utils";
import type { Task } from "@/lib/types/database";
import type {
  CreateTaskInput,
  TaskFilters,
  UpdateTaskInput,
  Workspace,
} from "@/lib/db/types";

export async function getTasks(
  workspace: Workspace,
  filters?: TaskFilters
): Promise<Task[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("workspace", workspace)
    .order("timeline_end", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,purpose.ilike.%${filters.search}%,category.ilike.%${filters.search}%`
    );
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.month) {
    const monthStart = filters.month.slice(0, 10);
    const monthDate = new Date(`${monthStart}T00:00:00`);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const monthEndStr = monthEnd.toISOString().slice(0, 10);

    query = query
      .gte("timeline_end", monthStart)
      .lte("timeline_end", monthEndStr);
  }

  const result = await query;
  return assertList("getTasks", result);
}

export async function getTask(id: string): Promise<Task | null> {
  const supabase = await createClient();
  const result = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();

  if (result.error) {
    throw new Error(`getTask: ${result.error.message}`);
  }

  return result.data;
}

export async function getTaskOrThrow(id: string): Promise<Task> {
  const supabase = await createClient();
  const result = await supabase.from("tasks").select("*").eq("id", id).single();
  return assertSingle("getTaskOrThrow", result);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = await createClient();
  const result = await supabase.from("tasks").insert(input).select("*").single();
  return assertSingle("createTask", result);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const supabase = await createClient();
  const result = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  return assertSingle("updateTask", result);
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient();
  const result = await supabase.from("tasks").delete().eq("id", id);
  assertNoError("deleteTask", { data: null, error: result.error });
}

export async function getWorkspaceStats(workspace: Workspace) {
  const supabase = await createClient();
  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const today = now.toISOString().slice(0, 10);
  const weekEnd = weekFromNow.toISOString().slice(0, 10);

  const [activeResult, dueResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("workspace", workspace)
      .neq("status", "done"),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("workspace", workspace)
      .neq("status", "done")
      .gte("timeline_end", today)
      .lte("timeline_end", weekEnd),
  ]);

  assertNoError("getWorkspaceStats.active", {
    data: null,
    error: activeResult.error,
  });
  assertNoError("getWorkspaceStats.due", { data: null, error: dueResult.error });

  return {
    active: activeResult.count ?? 0,
    dueThisWeek: dueResult.count ?? 0,
  };
}

export async function getTaskCategories(
  workspace: Workspace
): Promise<string[]> {
  const supabase = await createClient();
  const result = await supabase
    .from("tasks")
    .select("category")
    .eq("workspace", workspace)
    .not("category", "is", null);

  const rows = assertList("getTaskCategories", result);
  const categories = new Set<string>();

  for (const row of rows) {
    if (row.category) {
      categories.add(row.category);
    }
  }

  return [...categories].sort();
}

export async function getDueSoonTasks(workspace: Workspace, limit = 3) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekEnd = weekFromNow.toISOString().slice(0, 10);

  const result = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace", workspace)
    .neq("status", "done")
    .gte("timeline_end", today)
    .lte("timeline_end", weekEnd)
    .order("timeline_end", { ascending: true })
    .limit(limit);

  return assertList("getDueSoonTasks", result);
}
