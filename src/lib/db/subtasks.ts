import { createClient } from "@/lib/supabase/server";
import { assertList, assertNoError, assertSingle } from "@/lib/db/utils";
import type { Subtask } from "@/lib/types/database";
import type { CreateSubtaskInput, UpdateSubtaskInput } from "@/lib/db/types";

export async function getSubtasksByTask(taskId: string): Promise<Subtask[]> {
  const supabase = await createClient();
  const result = await supabase
    .from("subtasks")
    .select("*")
    .eq("task_id", taskId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return assertList("getSubtasksByTask", result);
}

export async function getSubtasksByTaskIds(
  taskIds: string[]
): Promise<Subtask[]> {
  if (taskIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const result = await supabase
    .from("subtasks")
    .select("*")
    .in("task_id", taskIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return assertList("getSubtasksByTaskIds", result);
}

export async function createSubtask(input: CreateSubtaskInput): Promise<Subtask> {
  const supabase = await createClient();
  const result = await supabase
    .from("subtasks")
    .insert(input)
    .select("*")
    .single();

  return assertSingle("createSubtask", result);
}

export async function updateSubtask(
  id: string,
  input: UpdateSubtaskInput
): Promise<Subtask> {
  const supabase = await createClient();
  const result = await supabase
    .from("subtasks")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  return assertSingle("updateSubtask", result);
}

export async function deleteSubtask(id: string): Promise<void> {
  const supabase = await createClient();
  const result = await supabase.from("subtasks").delete().eq("id", id);
  assertNoError("deleteSubtask", { data: null, error: result.error });
}

export async function getNextSubtaskSortOrder(
  taskId: string,
  parentSubtaskId: string | null = null
): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("subtasks")
    .select("sort_order")
    .eq("task_id", taskId)
    .order("sort_order", { ascending: false })
    .limit(1);

  query = parentSubtaskId
    ? query.eq("parent_subtask_id", parentSubtaskId)
    : query.is("parent_subtask_id", null);

  const result = await query.maybeSingle();

  if (result.error) {
    throw new Error(`getNextSubtaskSortOrder: ${result.error.message}`);
  }

  return (result.data?.sort_order ?? -1) + 1;
}
