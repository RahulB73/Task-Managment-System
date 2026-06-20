"use client";

import { useActionState, useState } from "react";
import { createTaskAction, type ActionState } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TASK_STATUSES } from "@/lib/constants/task-status";
import type { Workspace } from "@/lib/types/app";

const initialState: ActionState = {};

type CreateTaskFormProps = {
  workspace: Workspace;
  itemLabel: string;
};

export function CreateTaskForm({ workspace, itemLabel }: CreateTaskFormProps) {
  const [open, setOpen] = useState(false);

  async function createAction(_prevState: ActionState, formData: FormData) {
    return createTaskAction(workspace, _prevState, formData);
  }

  const [state, formAction, pending] = useActionState(createAction, initialState);

  return (
    <div>
      <Button type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Cancel" : `+ Add ${itemLabel}`}
      </Button>

      {open && (
        <form
          action={formAction}
          className="mt-4 space-y-4 rounded-xl border border-border bg-card p-5 animate-scale-in motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-lg"
        >
          <Input
            label="Title"
            name="title"
            placeholder={`New ${itemLabel.toLowerCase()} title`}
            required
          />
          <Input
            label="Category"
            name="category"
            placeholder="e.g. AI Mastery"
          />
          <Textarea
            label="Purpose"
            name="purpose"
            placeholder="Why does this matter?"
          />
          <Textarea
            label="Expected result"
            name="expected_result"
            placeholder="What does done look like?"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Start date" name="timeline_start" type="date" />
            <Input label="Due date" name="timeline_end" type="date" />
          </div>
          <div>
            <label htmlFor="create-status" className="mb-2 block text-sm text-muted">
              Status
            </label>
            <select
              id="create-status"
              name="status"
              defaultValue="in_progress"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {TASK_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Creating..." : `Create ${itemLabel.toLowerCase()}`}
          </Button>
        </form>
      )}
    </div>
  );
}
