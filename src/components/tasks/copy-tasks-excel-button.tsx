"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTasksForExcel } from "@/lib/export/tasks-to-excel";
import type { TaskListItem } from "@/lib/db/queries";

type CopyTasksExcelButtonProps = {
  tasks: TaskListItem[];
  reportDate: string;
  label?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary";
};

export function CopyTasksExcelButton({
  tasks,
  reportDate,
  label = "Copy for Excel",
  size = "sm",
  variant = "secondary",
}: CopyTasksExcelButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCopy() {
    setError(null);

    if (tasks.length === 0) {
      setError("No tasks to copy.");
      return;
    }

    try {
      const text = formatTasksForExcel(tasks, reportDate);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError("Could not copy. Check browser permissions.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size={size}
        variant={variant}
        onClick={handleCopy}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            {label}
          </>
        )}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
