-- Task priority order within workspace + category

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS tasks_workspace_category_sort_idx
  ON public.tasks (workspace, category, sort_order);

-- Backfill existing tasks by created_at within each workspace + category group
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY workspace, COALESCE(category, '')
      ORDER BY created_at ASC
    ) - 1 AS new_order
  FROM public.tasks
)
UPDATE public.tasks AS t
SET sort_order = ranked.new_order
FROM ranked
WHERE t.id = ranked.id;
