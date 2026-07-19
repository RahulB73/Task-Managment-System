"use client";

import { useActionState, useEffect, useState } from "react";
import { updateTaskDetails, type ActionState } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { TASK_STATUSES } from "@/lib/constants/task-status";
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

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Edit task
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit task"
        description="Update details and save."
        size="lg"
      >
        <form action={formAction} className="space-y-4">
          <Input label="Title" name="title" defaultValue={task.title} required autoFocus />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Client / Category"
              name="category"
              defaultValue={task.category ?? ""}
            />
            <div>
              <label htmlFor="status" className="mb-2 block text-sm text-muted">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={task.status}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
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

          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          {state.success && <p className="text-sm text-success">{state.success}</p>}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
