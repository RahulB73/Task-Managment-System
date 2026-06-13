import type { Workspace } from "@/lib/types/app";

export function isWorkspace(value: string): value is Workspace {
  return value === "office" || value === "personal";
}

export function workspaceLabel(workspace: Workspace) {
  return workspace === "office" ? "Office Tasks" : "Personal Goals";
}
