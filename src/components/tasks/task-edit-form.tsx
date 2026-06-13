"use client";

import { useActionState, useState } from "react";
import { updateTaskDetails, type ActionState } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TaskListItem } from "@/lib/db/queries";
import type { Workspace } from "@/lib/types/app";

const initialState: ActionState = {};

type TaskEditFormProps = {
  workspace: Workspace;
  task: TaskListItem;
};

export function TaskEditForm({ workspace, task }: TaskEditFormProps) {
  const [open, setOpen] = useState(false);

  async function saveTaskAction(_prevState: ActionState, formData: FormData) {
    return updateTaskDetails(workspace, task.id, _prevState, formData);
  }

  const [state, formAction, pending] = useActionState(saveTaskAction, initialState);

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close editor" : "Edit task"}
      </Button>

      {open && (
        <form
          action={formAction}
          className="mt-6 space-y-4 rounded-xl border border-border bg-background p-5"
        >
          <Input label="Title" name="title" defaultValue={task.title} required />
          <Input
            label="Category"
            name="category"
            defaultValue={task.category ?? ""}
          />
          <Textarea
            label="Purpose"
            name="purpose"
            defaultValue={task.purpose ?? ""}
          />
          <Textarea
            label="Expected result"
            name="expected_result"
            defaultValue={task.expected_result ?? ""}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Timeline start"
              name="timeline_start"
              type="date"
              defaultValue={task.timeline_start ?? ""}
            />
            <Input
              label="Timeline end"
              name="timeline_end"
              type="date"
              defaultValue={task.timeline_end ?? ""}
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-2 block text-sm text-muted">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={task.status}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {state.error && (
            <p className="text-sm text-danger">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-success">{state.success}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      )}
    </div>
  );
}
