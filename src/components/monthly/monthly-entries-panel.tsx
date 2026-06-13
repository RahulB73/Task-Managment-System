"use client";

import { useActionState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  addMonthlyEntryAction,
  deleteMonthlyEntryAction,
  type ActionState,
} from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MonthlyEntry } from "@/lib/types/database";
import type { TaskListItem } from "@/lib/db/queries";

const initialState: ActionState = {};

type MonthlyEntriesPanelProps = {
  monthStart: string;
  type: "win" | "focus";
  title: string;
  entries: MonthlyEntry[];
  tasks: TaskListItem[];
  placeholder: string;
};

export function MonthlyEntriesPanel({
  monthStart,
  type,
  title,
  entries,
  tasks,
  placeholder,
}: MonthlyEntriesPanelProps) {
  async function submitAction(_prev: ActionState, formData: FormData) {
    formData.set("type", type);
    return addMonthlyEntryAction(monthStart, formData);
  }

  const [state, formAction, pending] = useActionState(submitAction, initialState);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">{title}</h3>

      {entries.length === 0 ? (
        <p className="text-sm text-muted">Nothing added yet.</p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <MonthlyEntryItem key={entry.id} entry={entry} prefix={type === "win" ? "✓" : "→"} />
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 border-t border-border pt-4">
        <Input name="content" placeholder={placeholder} required />
        {type === "focus" && tasks.length > 0 && (
          <select
            name="task_id"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            defaultValue=""
          >
            <option value="">Link to a task (optional)</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        )}
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.success && <p className="text-sm text-success">{state.success}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          Add {type === "win" ? "win" : "focus item"}
        </Button>
      </form>
    </div>
  );
}

function MonthlyEntryItem({
  entry,
  prefix,
}: {
  entry: MonthlyEntry;
  prefix: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="group flex items-start justify-between gap-3 rounded-lg bg-background/50 px-3 py-2 text-sm">
      <span className="text-foreground">
        {prefix} {entry.content}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await deleteMonthlyEntryAction(entry.id);
          })
        }
        className="shrink-0 text-muted hover:text-danger"
        aria-label="Delete entry"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
