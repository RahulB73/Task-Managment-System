import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight } from "lucide-react";
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
    <Card interactive className="border-primary/30 bg-primary/5 mx-4 sm:mx-0">
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Continue where you left off
          </p>
          <p className="mt-1 truncate font-semibold text-foreground">{task.title}</p>
          <div className="mt-3 max-w-sm">
            <ProgressBar value={progress} showLabel />
          </div>
        </div>
        <Link href={`/${lastTask.workspace}/${task.id}`} className="shrink-0">
          <Button className="gap-2">
            Resume
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
