/** URL param value for tasks with no category */
export const UNCATEGORIZED_CATEGORY = "__uncategorized__";

export function categoryFilterLabel(category: string): string {
  if (category === UNCATEGORIZED_CATEGORY) {
    return "Uncategorized";
  }

  return category;
}
