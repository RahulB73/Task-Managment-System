import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getTask } from "@/lib/db/tasks";
import { getSubtasksByTask } from "@/lib/db/subtasks";
import { calculateProgressFromSubtasks } from "@/lib/progress";
import { LAST_TASK_COOKIE, parseLastTask } from "@/lib/last-task";

export async function ContinueTaskCard() {
  const cookieStore = await cookies();
  const lastTask = parseLastTask(cookieStore.get(LAST_TASK_COOKIE)?.value);

  if (!lastTask) {
    return null;
  }

  const task = await getTask(lastTask.taskId);

  if (!task || task.workspace !== lastTask.workspace) {
    return null;
  }

  const subtasks = await getSubtasksByTask(task.id);
  const progress = calculateProgressFromSubtasks(subtasks);

  return (
    <Card interactive className="min-w-0 border-primary/30 bg-primary/5">
      <CardContent className="flex min-w-0 flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-accent sm:text-xs">
            Continue where you left off
          </p>
          <Link
            href={`/${lastTask.workspace}/${task.id}`}
            className="mt-1 block truncate font-semibold text-foreground hover:text-accent"
          >
            {task.title}
          </Link>
          <div className="mt-2 max-w-full sm:max-w-sm">
            <ProgressBar value={progress} showLabel size="sm" />
          </div>
        </div>
        <Link href={`/${lastTask.workspace}/${task.id}`} className="shrink-0">
          <Button size="sm" className="w-full gap-2 sm:w-auto">
            Resume
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
