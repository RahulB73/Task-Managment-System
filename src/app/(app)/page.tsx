import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { getWorkspaceStats, getDueSoonTasks } from "@/lib/db/tasks";
import { ContinueTaskCard } from "@/components/tasks/continue-task-card";
import { Button } from "@/components/ui/button";
import { formatTimelineDate } from "@/lib/progress";
import type { Task } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [officeStats, personalStats, officeDueSoon, personalDueSoon] =
    await Promise.all([
      getWorkspaceStats("office"),
      getWorkspaceStats("personal"),
      getDueSoonTasks("office"),
      getDueSoonTasks("personal"),
    ]);

  const firstName = formatFirstName(user?.email);
  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(96,165,250,0.12),_transparent_40%)]" />

      <header className="relative z-10 flex items-center justify-between border-b border-border/60 px-4 py-4 sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
            TaskFlow
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="secondary" size="sm">
            Logout
          </Button>
        </form>
      </header>

      <div className="relative z-10 flex flex-1 flex-col px-4 py-8 sm:px-8">
        <div className="mx-auto w-full max-w-5xl text-center">
          <p className="text-sm text-muted">Welcome back,</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {firstName}
          </h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Choose your workspace to continue
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-5xl space-y-6 animate-fade-in">
          <ContinueTaskCard />

          <div className="grid gap-6 lg:grid-cols-2">
            <WorkspaceCard
              emoji="💼"
              title="Office"
              subtitle="Work tasks and deliverables"
              activeLabel="Active Tasks"
              activeCount={officeStats.active}
              dueCount={officeStats.dueThisWeek}
              href="/office"
              buttonLabel="Enter Office"
              dueSoon={officeDueSoon}
            />
            <WorkspaceCard
              emoji="🎯"
              title="Personal"
              subtitle="Long-term goals and learning"
              activeLabel="Active Goals"
              activeCount={personalStats.active}
              dueCount={personalStats.dueThisWeek}
              href="/personal"
              buttonLabel="Enter Personal"
              dueSoon={personalDueSoon}
            />
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-border/60 px-4 py-4 text-center text-sm text-muted">
        Month: {monthLabel}
      </footer>
    </div>
  );
}

function formatFirstName(email?: string | null) {
  if (!email) {
    return "there";
  }

  const localPart = email.split("@")[0] ?? "there";
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type WorkspaceCardProps = {
  emoji: string;
  title: string;
  subtitle: string;
  activeLabel: string;
  activeCount: number;
  dueCount: number;
  href: string;
  buttonLabel: string;
  dueSoon: Task[];
};

function WorkspaceCard({
  emoji,
  title,
  subtitle,
  activeLabel,
  activeCount,
  dueCount,
  href,
  buttonLabel,
  dueSoon,
}: WorkspaceCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/80 bg-card/90 p-6 shadow-xl shadow-black/20 backdrop-blur-sm motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-primary/40 motion-safe:hover:bg-card motion-safe:hover:shadow-2xl motion-safe:hover:shadow-primary/10 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.995]">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
          {emoji}
        </span>
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatBlock label={activeLabel} value={activeCount} />
        <StatBlock label="Due This Week" value={dueCount} accent />
      </div>

      {dueSoon.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-xl bg-background/50 px-4 py-3 text-sm text-muted">
          {dueSoon.slice(0, 2).map((task) => (
            <li key={task.id} className="truncate">
              {task.title} · {formatTimelineDate(task.timeline_end)}
            </li>
          ))}
        </ul>
      )}

      <Link href={href} className="mt-6">
        <Button className="w-full gap-2">
          {buttonLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-background/60 px-4 py-3">
      <p className={`text-2xl font-bold ${accent ? "text-accent" : "text-foreground"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
