import { createClient } from "@/lib/supabase/server";
import { assertList, assertNoError, assertSingle } from "@/lib/db/utils";
import type { Review } from "@/lib/types/database";
import type { CreateReviewInput } from "@/lib/db/types";

export async function getReviewsByTask(taskId: string): Promise<Review[]> {
  const supabase = await createClient();
  const result = await supabase
    .from("reviews")
    .select("*")
    .eq("task_id", taskId)
    .order("review_date", { ascending: false })
    .order("created_at", { ascending: false });

  return assertList("getReviewsByTask", result);
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const supabase = await createClient();
  const result = await supabase
    .from("reviews")
    .insert(input)
    .select("*")
    .single();

  return assertSingle("createReview", result);
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = await createClient();
  const result = await supabase.from("reviews").delete().eq("id", id);
  assertNoError("deleteReview", { data: null, error: result.error });
}
