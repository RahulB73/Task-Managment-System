"use client";

import { useEffect } from "react";
import {
  LAST_TASK_COOKIE,
  serializeLastTask,
  type LastTaskCookie,
} from "@/lib/last-task";

export function RememberLastTask(props: LastTaskCookie) {
  useEffect(() => {
    const value = serializeLastTask(props);
    document.cookie = `${LAST_TASK_COOKIE}=${value}; path=/; max-age=2592000; samesite=lax`;
  }, [props.workspace, props.taskId, props.title]);

  return null;
}
