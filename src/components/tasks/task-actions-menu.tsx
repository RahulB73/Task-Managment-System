"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Trash2 } from "lucide-react";
import { deleteTaskAction } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import type { Workspace } from "@/lib/types/app";
import { cn } from "@/lib/utils/cn";

type TaskActionsMenuProps = {
  workspace: Workspace;
  taskId: string;
  taskTitle: string;
  returnTo?: string;
  variant?: "icon" | "button";
};

export function TaskActionsMenu({
  workspace,
  taskId,
  taskTitle,
  returnTo,
  variant = "icon",
}: TaskActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      return;
    }

    function updatePosition() {
      if (!buttonRef.current) {
        return;
      }

      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 224;
      const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));

      setMenuPosition({
        top: rect.bottom + 6,
        left,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setConfirming(false);
    setMenuPosition(null);
  }

  function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setOpen((value) => !value);
    if (open) {
      setConfirming(false);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteTaskAction(workspace, taskId, returnTo);
    });
  }

  const menu =
    open && menuPosition && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[100] bg-transparent"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <div
              className="fixed z-[110] w-56 animate-scale-in rounded-xl border border-border bg-card p-2 shadow-2xl"
              style={{ top: menuPosition.top, left: menuPosition.left }}
              onClick={(event) => event.stopPropagation()}
            >
              {!confirming ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-danger hover:bg-danger/10"
                  onClick={() => setConfirming(true)}
                >
                  <Trash2 className="h-4 w-4 shrink-0" />
                  Delete task
                </button>
              ) : (
                <div className="space-y-2 p-2">
                  <p className="text-xs leading-relaxed text-muted">
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
          </>,
          document.body
        )
      : null;

  return (
    <div className="relative shrink-0">
      <Button
        ref={buttonRef}
        type="button"
        variant={variant === "icon" ? "ghost" : "danger"}
        size="sm"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg touch-manipulation",
          "motion-safe:transition-all motion-safe:duration-150",
          "hover:scale-105 hover:bg-card-hover active:scale-95",
          variant === "icon" && "h-9 w-9 p-0"
        )}
        onClick={handleToggle}
        onPointerDown={(event) => event.stopPropagation()}
        aria-label="Task actions"
        aria-expanded={open}
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
      {menu}
    </div>
  );
}
