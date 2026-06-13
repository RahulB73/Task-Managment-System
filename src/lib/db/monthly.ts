import { createClient } from "@/lib/supabase/server";
import { assertList, assertNoError, assertSingle } from "@/lib/db/utils";
import type { MonthlyEntry } from "@/lib/types/database";
import type { CreateMonthlyEntryInput, MonthlyEntryType } from "@/lib/db/types";

function normalizeMonth(month: string): string {
  const date = new Date(`${month.slice(0, 10)}T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

export async function getMonthlyEntries(
  month: string,
  type?: MonthlyEntryType
): Promise<MonthlyEntry[]> {
  const supabase = await createClient();
  const monthStart = normalizeMonth(month);

  let query = supabase
    .from("monthly_entries")
    .select("*")
    .eq("month", monthStart)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (type) {
    query = query.eq("type", type);
  }

  const result = await query;
  return assertList("getMonthlyEntries", result);
}

export async function createMonthlyEntry(
  input: CreateMonthlyEntryInput
): Promise<MonthlyEntry> {
  const supabase = await createClient();
  const result = await supabase
    .from("monthly_entries")
    .insert({
      ...input,
      month: normalizeMonth(input.month),
    })
    .select("*")
    .single();

  return assertSingle("createMonthlyEntry", result);
}

export async function deleteMonthlyEntry(id: string): Promise<void> {
  const supabase = await createClient();
  const result = await supabase.from("monthly_entries").delete().eq("id", id);
  assertNoError("deleteMonthlyEntry", { data: null, error: result.error });
}

export async function getNextMonthlyEntrySortOrder(
  month: string,
  type: MonthlyEntryType
): Promise<number> {
  const supabase = await createClient();
  const monthStart = normalizeMonth(month);

  const result = await supabase
    .from("monthly_entries")
    .select("sort_order")
    .eq("month", monthStart)
    .eq("type", type)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    throw new Error(`getNextMonthlyEntrySortOrder: ${result.error.message}`);
  }

  return (result.data?.sort_order ?? -1) + 1;
}
