import type { SubtaskStatus } from "@/lib/types/app";
import type { Subtask } from "@/lib/types/database";

export type SubtaskNode = {
  id: string;
  title: string;
  status: SubtaskStatus;
  sort_order: number;
  parent_subtask_id: string | null;
  children: SubtaskNode[];
};

function sortNodes(nodes: SubtaskNode[]): SubtaskNode[] {
  return nodes
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((node) => ({
      ...node,
      children: sortNodes(node.children),
    }));
}

export function buildSubtaskTree(subtasks: Subtask[]): SubtaskNode[] {
  const nodes = new Map<string, SubtaskNode>();
  const roots: SubtaskNode[] = [];

  for (const subtask of subtasks) {
    nodes.set(subtask.id, {
      id: subtask.id,
      title: subtask.title,
      status: subtask.status,
      sort_order: subtask.sort_order,
      parent_subtask_id: subtask.parent_subtask_id,
      children: [],
    });
  }

  for (const subtask of subtasks) {
    const node = nodes.get(subtask.id)!;

    if (subtask.parent_subtask_id) {
      nodes.get(subtask.parent_subtask_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return sortNodes(roots);
}

function collectLeaves(nodes: SubtaskNode[]): SubtaskNode[] {
  const leaves: SubtaskNode[] = [];

  for (const node of nodes) {
    if (node.children.length > 0) {
      leaves.push(...collectLeaves(node.children));
    } else {
      leaves.push(node);
    }
  }

  return leaves;
}

export function calculateProgress(nodes: SubtaskNode[]): number {
  const leaves = collectLeaves(nodes);

  if (leaves.length === 0) {
    return 0;
  }

  const completed = leaves.filter((node) => node.status === "done").length;
  return Math.round((completed / leaves.length) * 100);
}

export function calculateProgressFromSubtasks(subtasks: Subtask[]): number {
  return calculateProgress(buildSubtaskTree(subtasks));
}

export function formatTimelineDate(date: string | null): string {
  if (!date) {
    return "—";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function formatTimelineRange(
  start: string | null,
  end: string | null
): string {
  if (!start && !end) {
    return "—";
  }

  return `${formatTimelineDate(start)} → ${formatTimelineDate(end)}`;
}

export function formatReviewDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getSubtreeLeafCounts(node: SubtaskNode): {
  done: number;
  total: number;
} {
  if (node.children.length === 0) {
    return {
      done: node.status === "done" ? 1 : 0,
      total: 1,
    };
  }

  return node.children.reduce(
    (acc, child) => {
      const counts = getSubtreeLeafCounts(child);
      return {
        done: acc.done + counts.done,
        total: acc.total + counts.total,
      };
    },
    { done: 0, total: 0 }
  );
}

export function getNextSubtaskStatus(
  current: SubtaskStatus
): SubtaskStatus {
  if (current === "pending") {
    return "in_progress";
  }

  if (current === "in_progress") {
    return "done";
  }

  return "pending";
}
