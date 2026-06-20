export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          workspace: "office" | "personal";
          title: string;
          purpose: string | null;
          expected_result: string | null;
          timeline_start: string | null;
          timeline_end: string | null;
          status: "pending" | "in_progress" | "in_testing" | "done" | "paused";
          category: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          workspace: "office" | "personal";
          title: string;
          purpose?: string | null;
          expected_result?: string | null;
          timeline_start?: string | null;
          timeline_end?: string | null;
          status?: "pending" | "in_progress" | "in_testing" | "done" | "paused";
          category?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace?: "office" | "personal";
          title?: string;
          purpose?: string | null;
          expected_result?: string | null;
          timeline_start?: string | null;
          timeline_end?: string | null;
          status?: "pending" | "in_progress" | "in_testing" | "done" | "paused";
          category?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          parent_subtask_id: string | null;
          user_id: string;
          title: string;
          status: "pending" | "in_progress" | "done";
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          parent_subtask_id?: string | null;
          user_id?: string;
          title: string;
          status?: "pending" | "in_progress" | "done";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          parent_subtask_id?: string | null;
          user_id?: string;
          title?: string;
          status?: "pending" | "in_progress" | "done";
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          subtask_id: string | null;
          comment: string;
          review_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id?: string;
          subtask_id?: string | null;
          comment: string;
          review_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          subtask_id?: string | null;
          comment?: string;
          review_date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      monthly_entries: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          type: "win" | "focus";
          content: string;
          task_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          month: string;
          type: "win" | "focus";
          content: string;
          task_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          type?: "win" | "focus";
          content?: string;
          task_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      daily_priorities: {
        Row: {
          id: string;
          user_id: string;
          priority_date: string;
          task_id: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          priority_date: string;
          task_id: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          priority_date?: string;
          task_id?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Task = Tables<"tasks">;
export type Subtask = Tables<"subtasks">;
export type Review = Tables<"reviews">;
export type MonthlyEntry = Tables<"monthly_entries">;
export type DailyPriority = Tables<"daily_priorities">;
