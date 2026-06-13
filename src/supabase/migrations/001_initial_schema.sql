-- TaskFlow: initial schema
-- Run in Supabase Dashboard → SQL Editor (before 002_rls_policies.sql)

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;

  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------------

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  workspace text NOT NULL CHECK (workspace IN ('office', 'personal')),
  title text NOT NULL,
  purpose text,
  expected_result text,
  timeline_start date,
  timeline_end date,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'done', 'paused')),
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX tasks_user_id_idx ON public.tasks (user_id);
CREATE INDEX tasks_workspace_idx ON public.tasks (workspace);
CREATE INDEX tasks_timeline_end_idx ON public.tasks (timeline_end);
CREATE INDEX tasks_status_idx ON public.tasks (status);

CREATE TRIGGER tasks_set_user_id
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- subtasks (unlimited nesting via parent_subtask_id)
-- ---------------------------------------------------------------------------

CREATE TABLE public.subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  parent_subtask_id uuid REFERENCES public.subtasks (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'done')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subtasks_task_id_idx ON public.subtasks (task_id);
CREATE INDEX subtasks_parent_subtask_id_idx ON public.subtasks (parent_subtask_id);
CREATE INDEX subtasks_user_id_idx ON public.subtasks (user_id);

CREATE TRIGGER subtasks_set_user_id
  BEFORE INSERT ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER subtasks_set_updated_at
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- reviews (dated feedback on a task)
-- ---------------------------------------------------------------------------

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  subtask_id uuid REFERENCES public.subtasks (id) ON DELETE SET NULL,
  comment text NOT NULL,
  review_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reviews_task_id_idx ON public.reviews (task_id);
CREATE INDEX reviews_user_id_idx ON public.reviews (user_id);
CREATE INDEX reviews_review_date_idx ON public.reviews (review_date DESC);

CREATE TRIGGER reviews_set_user_id
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

-- ---------------------------------------------------------------------------
-- monthly_entries (wins & next-month focus)
-- ---------------------------------------------------------------------------

CREATE TABLE public.monthly_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  month date NOT NULL,
  type text NOT NULL CHECK (type IN ('win', 'focus')),
  content text NOT NULL,
  task_id uuid REFERENCES public.tasks (id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT monthly_entries_month_starts_on_first CHECK (
    date_trunc('month', month) = month
  )
);

CREATE INDEX monthly_entries_user_id_idx ON public.monthly_entries (user_id);
CREATE INDEX monthly_entries_month_idx ON public.monthly_entries (month DESC);
CREATE INDEX monthly_entries_type_idx ON public.monthly_entries (type);

CREATE TRIGGER monthly_entries_set_user_id
  BEFORE INSERT ON public.monthly_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();
