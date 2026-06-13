import type { PostgrestError } from "@supabase/supabase-js";

export class DbError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "DbError";
  }
}

export function assertList<T>(
  label: string,
  result: { data: T[] | null; error: PostgrestError | null }
): T[] {
  if (result.error) {
    throw new DbError(`${label}: ${result.error.message}`, result.error.code);
  }

  return result.data ?? [];
}

export function assertNoError<T>(
  label: string,
  result: { data: T; error: PostgrestError | null }
): T {
  if (result.error) {
    throw new DbError(`${label}: ${result.error.message}`, result.error.code);
  }

  return result.data;
}

export function assertSingle<T>(
  label: string,
  result: { data: T | null; error: PostgrestError | null }
): T {
  const data = assertNoError(label, { data: result.data, error: result.error });

  if (!data) {
    throw new DbError(`${label}: not found`);
  }

  return data;
}
