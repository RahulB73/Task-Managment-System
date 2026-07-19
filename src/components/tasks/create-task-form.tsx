"use client";

import { useActionState, useEffect, useState } from "react";
import { createTaskAction, type ActionState } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
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

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        + Add {itemLabel}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`New ${itemLabel.toLowerCase()}`}
        description="Fill the essentials — you can refine details later."
        size="lg"
      >
        <form action={formAction} className="space-y-4">
          <Input
            label="Title"
            name="title"
            placeholder={`New ${itemLabel.toLowerCase()} title`}
            required
            autoFocus
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Client / Category"
              name="category"
              placeholder="e.g. UPSC"
            />
            <div>
              <label htmlFor="create-status" className="mb-2 block text-sm text-muted">
                Status
              </label>
              <select
                id="create-status"
                name="status"
                defaultValue="in_progress"
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
            <Input label="Start date" name="timeline_start" type="date" />
            <Input label="Due date" name="timeline_end" type="date" />
          </div>
          <Textarea
            label="Purpose (optional)"
            name="purpose"
            placeholder="Why does this matter?"
          />
          <Textarea
            label="Expected result (optional)"
            name="expected_result"
            placeholder="What does done look like?"
          />

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : `Create ${itemLabel.toLowerCase()}`}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
