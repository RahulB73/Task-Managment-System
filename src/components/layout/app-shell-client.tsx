"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils/cn";

type AppShellClientProps = {
  userEmail?: string | null;
  children: React.ReactNode;
};

export function AppShellClient({ userEmail, children }: AppShellClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hideSidebar = pathname === "/";

  return (
    <div className="flex min-h-full flex-1 bg-background">
      {!hideSidebar && (
        <>
          <div className="hidden lg:flex">
            <Sidebar userEmail={userEmail} />
          </div>

          {open && (
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setOpen(false)}
            />
          )}

          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 lg:hidden",
              open ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Sidebar userEmail={userEmail} onNavigate={() => setOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {!hideSidebar && (
          <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground motion-safe:transition-all motion-safe:duration-150 hover:scale-105 hover:border-border-muted hover:bg-card-hover active:scale-95"
              aria-label="Open menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="text-sm font-semibold text-accent">
              TaskFlow
            </Link>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
