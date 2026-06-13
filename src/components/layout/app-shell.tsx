import { AppShellClient } from "@/components/layout/app-shell-client";

type AppShellProps = {
  userEmail?: string | null;
  children: React.ReactNode;
};

export function AppShell({ userEmail, children }: AppShellProps) {
  return <AppShellClient userEmail={userEmail}>{children}</AppShellClient>;
}
