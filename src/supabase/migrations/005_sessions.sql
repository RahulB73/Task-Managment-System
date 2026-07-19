-- Session tasks: hourly checklists with optional main-task linkage

CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  linked_task_id uuid REFERENCES public.tasks (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'done')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx
  ON public.sessions (user_id, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS sessions_linked_task_id_idx
  ON public.sessions (linked_task_id);

DROP TRIGGER IF EXISTS sessions_set_updated_at ON public.sessions;
CREATE TRIGGER sessions_set_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS sessions_set_user_id ON public.sessions;
CREATE TRIGGER sessions_set_user_id
  BEFORE INSERT ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own"
  ON public.sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_own"
  ON public.sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update_own"
  ON public.sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_delete_own"
  ON public.sessions FOR DELETE
  USING (user_id = auth.uid());

-- Session checklist items (nested, optional link to main subtasks)

CREATE TABLE IF NOT EXISTS public.session_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions (id) ON DELETE CASCADE,
  parent_item_id uuid REFERENCES public.session_items (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'done')),
  linked_subtask_id uuid REFERENCES public.subtasks (id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_items_session_id_idx
  ON public.session_items (session_id, sort_order);

CREATE INDEX IF NOT EXISTS session_items_parent_item_id_idx
  ON public.session_items (parent_item_id);

CREATE INDEX IF NOT EXISTS session_items_linked_subtask_id_idx
  ON public.session_items (linked_subtask_id);

DROP TRIGGER IF EXISTS session_items_set_updated_at ON public.session_items;
CREATE TRIGGER session_items_set_updated_at
  BEFORE UPDATE ON public.session_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS session_items_set_user_id ON public.session_items;
CREATE TRIGGER session_items_set_user_id
  BEFORE INSERT ON public.session_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

ALTER TABLE public.session_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_items_select_own"
  ON public.session_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "session_items_insert_own"
  ON public.session_items FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.sessions
      WHERE sessions.id = session_items.session_id
        AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "session_items_update_own"
  ON public.session_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "session_items_delete_own"
  ON public.session_items FOR DELETE
  USING (user_id = auth.uid());
