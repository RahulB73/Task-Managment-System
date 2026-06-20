-- Add "In Testing / Review" task status + daily priority queue

ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('pending', 'in_progress', 'in_testing', 'done', 'paused'));

CREATE TABLE IF NOT EXISTS public.daily_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  priority_date date NOT NULL,
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, priority_date, task_id)
);

CREATE INDEX IF NOT EXISTS daily_priorities_user_date_idx
  ON public.daily_priorities (user_id, priority_date, sort_order);

CREATE INDEX IF NOT EXISTS daily_priorities_task_id_idx
  ON public.daily_priorities (task_id);

DROP TRIGGER IF EXISTS daily_priorities_set_updated_at ON public.daily_priorities;
CREATE TRIGGER daily_priorities_set_updated_at
  BEFORE UPDATE ON public.daily_priorities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS daily_priorities_set_user_id ON public.daily_priorities;
CREATE TRIGGER daily_priorities_set_user_id
  BEFORE INSERT ON public.daily_priorities
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

ALTER TABLE public.daily_priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_priorities_select_own"
  ON public.daily_priorities FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "daily_priorities_insert_own"
  ON public.daily_priorities FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.tasks
      WHERE tasks.id = daily_priorities.task_id
        AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "daily_priorities_update_own"
  ON public.daily_priorities FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_priorities_delete_own"
  ON public.daily_priorities FOR DELETE
  USING (user_id = auth.uid());
