"use client";

import { useActionState, useState } from "react";
import { createSessionAction, type SessionActionState } from "@/lib/sessions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Session } from "@/lib/types/database";
import type { Task } from "@/lib/types/database";

const initialState: SessionActionState = {};

type CreateSessionFormProps = {
  tasks: Task[];
  existingSessions: Session[];
};

export function CreateSessionForm({ tasks, existingSessions }: CreateSessionFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createSessionAction, initialState);

  const unfinishedSessions = existingSessions.filter((session) => session.status === "active");

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        + New session
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New session"
        description="Start an hourly checklist. Optionally carry unfinished items from a previous session."
        size="md"
      >
        <form action={formAction} className="space-y-4">
          <Input
            label="Session title"
            name="title"
            placeholder="e.g. Hour 1 · Morning focus"
            required
            autoFocus
          />

          <div>
            <label htmlFor="linked-task" className="mb-2 block text-sm text-muted">
              Link to main task (optional)
            </label>
            <select
              id="linked-task"
              name="linked_task_id"
              defaultValue=""
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Independent session</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  [{task.workspace}] {task.title}
                  {task.category ? ` · ${task.category}` : ""}
                </option>
              ))}
            </select>
          </div>

          {unfinishedSessions.length > 0 && (
            <div>
              <label htmlFor="carry-from" className="mb-2 block text-sm text-muted">
                Move unfinished items from
              </label>
              <select
                id="carry-from"
                name="carry_from_session_id"
                defaultValue=""
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Start empty</option>
                {unfinishedSessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted">
                Only incomplete checklist items move into the new session.
              </p>
            </div>
          )}

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create session"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
