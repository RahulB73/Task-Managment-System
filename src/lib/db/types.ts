import type {
  TaskStatus,
  Workspace,
  MonthlyEntryType,
} from "@/lib/types/app";
import type { TablesInsert, TablesUpdate } from "@/lib/types/database";

export type TaskFilters = {
  search?: string;
  category?: string;
  status?: TaskStatus;
  /** First day of month, e.g. 2026-06-01 */
  month?: string;
};

export type CreateTaskInput = Pick<
  TablesInsert<"tasks">,
  | "workspace"
  | "title"
  | "purpose"
  | "expected_result"
  | "timeline_start"
  | "timeline_end"
  | "status"
  | "category"
>;

export type UpdateTaskInput = TablesUpdate<"tasks">;

export type CreateSubtaskInput = Pick<
  TablesInsert<"subtasks">,
  "task_id" | "parent_subtask_id" | "title" | "status" | "sort_order"
>;

export type UpdateSubtaskInput = TablesUpdate<"subtasks">;

export type CreateReviewInput = Pick<
  TablesInsert<"reviews">,
  "task_id" | "subtask_id" | "comment" | "review_date"
>;

export type CreateMonthlyEntryInput = Pick<
  TablesInsert<"monthly_entries">,
  "month" | "type" | "content" | "task_id" | "sort_order"
>;

export type TaskWithProgress = {
  progress: number;
};

export type { Workspace, TaskStatus, MonthlyEntryType };
