"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import type { Workspace } from "@/lib/types/app";
import { cn } from "@/lib/utils/cn";

type TaskActionsMenuProps = {
  workspace: Workspace;
  taskId: string;
  taskTitle: string;
  variant?: "icon" | "button";
};

export function TaskActionsMenu({
  workspace,
  taskId,
  taskTitle,
  variant = "icon",
}: TaskActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteTaskAction(workspace, taskId);
    });
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={variant === "icon" ? "ghost" : "danger"}
        size="sm"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg",
          "motion-safe:transition-all motion-safe:duration-150",
          "hover:scale-105 hover:bg-card-hover active:scale-95",
          variant === "icon" && "h-9 w-9 p-0"
        )}
        onClick={() => setOpen((value) => !value)}
        aria-label="Task actions"
      >
        {variant === "icon" ? (
          <MoreVertical className="h-4 w-4" />
        ) : (
          <>
            <Trash2 className="h-4 w-4" />
            Delete
          </>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30"
            aria-label="Close menu"
            onClick={() => {
              setOpen(false);
              setConfirming(false);
            }}
          />
          <div className="absolute right-0 z-40 mt-2 w-56 animate-scale-in rounded-xl border border-border bg-card p-2 shadow-xl">
            {!confirming ? (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete task
              </button>
            ) : (
              <div className="space-y-2 p-2">
                <p className="text-xs text-muted">
                  Delete &quot;{taskTitle}&quot; and all subtasks?
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    disabled={pending}
                    onClick={handleDelete}
                  >
                    {pending ? "Deleting..." : "Delete"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
