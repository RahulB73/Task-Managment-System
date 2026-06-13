-- TaskFlow: row level security
-- Run in Supabase Dashboard → SQL Editor (after 001_initial_schema.sql)

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_entries ENABLE ROW LEVEL SECURITY;

-- tasks ---------------------------------------------------------------------

CREATE POLICY "tasks_select_own"
  ON public.tasks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "tasks_insert_own"
  ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_update_own"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tasks_delete_own"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

-- subtasks ------------------------------------------------------------------

CREATE POLICY "subtasks_select_own"
  ON public.subtasks FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "subtasks_insert_own"
  ON public.subtasks FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.tasks
      WHERE tasks.id = subtasks.task_id
        AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "subtasks_update_own"
  ON public.subtasks FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subtasks_delete_own"
  ON public.subtasks FOR DELETE
  USING (user_id = auth.uid());

-- reviews -------------------------------------------------------------------

CREATE POLICY "reviews_select_own"
  ON public.reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.tasks
      WHERE tasks.id = reviews.task_id
        AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE
  USING (user_id = auth.uid());

-- monthly_entries -----------------------------------------------------------

CREATE POLICY "monthly_entries_select_own"
  ON public.monthly_entries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "monthly_entries_insert_own"
  ON public.monthly_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "monthly_entries_update_own"
  ON public.monthly_entries FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "monthly_entries_delete_own"
  ON public.monthly_entries FOR DELETE
  USING (user_id = auth.uid());
