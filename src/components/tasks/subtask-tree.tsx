"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import {
  addSubtaskAction,
  deleteSubtaskAction,
  reorderSubtasksAction,
  toggleSubtaskStatusAction,
} from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSubtreeLeafCounts, type SubtaskNode } from "@/lib/progress";
import type { Workspace } from "@/lib/types/app";
import { cn } from "@/lib/utils/cn";
import { motion } from "@/lib/utils/motion";

type SubtaskTreeProps = {
  workspace: Workspace;
  taskId: string;
  nodes: SubtaskNode[];
};

export function SubtaskTree({ workspace, taskId, nodes }: SubtaskTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => collectParentIds(nodes));

  if (nodes.length === 0) {
    return (
      <p className="text-sm text-muted">
        No subtasks yet. Add a category or first checklist item below.
      </p>
    );
  }

  return (
    <SortableSubtaskList
      nodes={nodes}
      depth={0}
      parentSubtaskId={null}
      workspace={workspace}
      taskId={taskId}
      expanded={expanded}
      setExpanded={setExpanded}
    />
  );
}

function collectParentIds(nodes: SubtaskNode[]): Set<string> {
  const ids = new Set<string>();

  function walk(items: SubtaskNode[]) {
    for (const item of items) {
      if (item.children.length > 0) {
        ids.add(item.id);
        walk(item.children);
      }
    }
  }

  walk(nodes);
  return ids;
}

type SortableSubtaskListProps = {
  nodes: SubtaskNode[];
  depth: number;
  parentSubtaskId: string | null;
  workspace: Workspace;
  taskId: string;
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
};

function SortableSubtaskList({
  nodes: initialNodes,
  depth,
  parentSubtaskId,
  workspace,
  taskId,
  expanded,
  setExpanded,
}: SortableSubtaskListProps) {
  const [nodes, setNodes] = useState(initialNodes);
  const [mounted, setMounted] = useState(false);
  const [pending, startTransition] = useTransition();
  const dndId = parentSubtaskId ?? "root";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = nodes.findIndex((node) => node.id === active.id);
    const newIndex = nodes.findIndex((node) => node.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const next = arrayMove(nodes, oldIndex, newIndex);
    setNodes(next);

    startTransition(async () => {
      await reorderSubtasksAction(
        workspace,
        taskId,
        next.map((node) => node.id)
      );
    });
  }

  const listItems = nodes.map((node, index) => (
    <SortableSubtaskNodeItem
      key={node.id}
      node={node}
      priority={index + 1}
      depth={depth}
      workspace={workspace}
      taskId={taskId}
      expanded={expanded}
      setExpanded={setExpanded}
      sortable={mounted}
    />
  ));

  return (
    <ul className={cn("space-y-1", pending && "opacity-70")}>
      {mounted ? (
        <DndContext
          id={`${taskId}-${dndId}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={nodes.map((node) => node.id)}
            strategy={verticalListSortingStrategy}
          >
            {listItems}
          </SortableContext>
        </DndContext>
      ) : (
        listItems
      )}
    </ul>
  );
}

type SortableSubtaskNodeItemProps = {
  node: SubtaskNode;
  priority: number;
  depth: number;
  workspace: Workspace;
  taskId: string;
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  sortable: boolean;
};

function SortableSubtaskNodeItem({
  node,
  priority,
  depth,
  workspace,
  taskId,
  expanded,
  setExpanded,
  sortable,
}: SortableSubtaskNodeItemProps) {
  const [pending, startTransition] = useTransition();
  const [addingChild, setAddingChild] = useState(false);
  const isParent = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isDone = node.status === "done";
  const counts = getSubtreeLeafCounts(node);

  const sortableState = useSortable({ id: node.id, disabled: !sortable });

  const style = sortable
    ? {
        transform: CSS.Transform.toString(sortableState.transform),
        transition: sortableState.transition,
      }
    : undefined;

  function toggleExpanded() {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      return next;
    });
  }

  function handleCheckToggle() {
    if (isParent) {
      return;
    }

    startTransition(async () => {
      await toggleSubtaskStatusAction(workspace, taskId, node.id, node.status);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteSubtaskAction(workspace, taskId, node.id);
    });
  }

  return (
    <li ref={sortable ? sortableState.setNodeRef : undefined} style={style}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border border-transparent py-2 pr-2",
          motion.row,
          pending && "opacity-60",
          sortable && sortableState.isDragging && "relative z-10 border-border bg-card shadow-md"
        )}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        {sortable ? (
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted hover:bg-card hover:text-foreground active:cursor-grabbing"
            aria-label={`Reorder ${node.title}`}
            {...sortableState.attributes}
            {...sortableState.listeners}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-muted">
            <GripVertical className="h-3.5 w-3.5 opacity-40" />
          </span>
        )}

        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-accent">
          {priority}
        </span>

        {isParent ? (
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-card hover:text-foreground"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <label className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-110">
            <input
              type="checkbox"
              checked={isDone}
              onChange={handleCheckToggle}
              className="h-4 w-4 cursor-pointer rounded border-border bg-background accent-primary motion-safe:transition-transform motion-safe:duration-150 motion-safe:hover:scale-110"
              aria-label={`Mark ${node.title} as done`}
            />
          </label>
        )}

        <span
          className={cn(
            "min-w-0 flex-1 text-sm",
            isDone && !isParent && "text-muted line-through decoration-muted"
          )}
        >
          {node.title}
        </span>

        {isParent && (
          <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
            {counts.done}/{counts.total}
          </span>
        )}

        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setAddingChild((value) => !value)}
            className="rounded-md px-2 py-1 text-xs text-accent hover:bg-card"
          >
            + Child
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted motion-safe:transition-all motion-safe:duration-150 hover:scale-110 hover:bg-danger/10 hover:text-danger active:scale-95"
            aria-label="Delete subtask"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {addingChild && (
        <div style={{ paddingLeft: `${(depth + 1) * 14 + 4}px` }} className="py-2">
          <AddSubtaskInlineForm
            workspace={workspace}
            taskId={taskId}
            parentSubtaskId={node.id}
            onDone={() => setAddingChild(false)}
          />
        </div>
      )}

      {isParent && isExpanded && (
        <SortableSubtaskList
          nodes={node.children}
          depth={depth + 1}
          parentSubtaskId={node.id}
          workspace={workspace}
          taskId={taskId}
          expanded={expanded}
          setExpanded={setExpanded}
        />
      )}
    </li>
  );
}

type AddSubtaskFormProps = {
  workspace: Workspace;
  taskId: string;
  parentSubtaskId?: string | null;
  onDone?: () => void;
};

export function AddSubtaskForm({
  workspace,
  taskId,
  parentSubtaskId = null,
}: AddSubtaskFormProps) {
  return (
    <AddSubtaskInlineForm
      workspace={workspace}
      taskId={taskId}
      parentSubtaskId={parentSubtaskId}
    />
  );
}

function AddSubtaskInlineForm({
  workspace,
  taskId,
  parentSubtaskId = null,
  onDone,
}: AddSubtaskFormProps) {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.set("title", title);
    if (parentSubtaskId) {
      formData.set("parent_subtask_id", parentSubtaskId);
    }

    startTransition(async () => {
      await addSubtaskAction(workspace, taskId, formData);
      setTitle("");
      onDone?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={
          parentSubtaskId ? "Add checklist item..." : "Add category or checklist item..."
        }
        required
      />
      <Button type="submit" size="sm" disabled={pending} className="shrink-0">
        Add
      </Button>
    </form>
  );
}
