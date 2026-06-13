"use client";

import { useActionState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addReviewAction, deleteReviewAction, type ActionState } from "@/lib/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatReviewDate } from "@/lib/progress";
import type { Review } from "@/lib/types/database";
import type { Workspace } from "@/lib/types/app";

const initialState: ActionState = {};

type ReviewsPanelProps = {
  workspace: Workspace;
  taskId: string;
  reviews: Review[];
};

export function ReviewsPanel({ workspace, taskId, reviews }: ReviewsPanelProps) {
  async function reviewFormAction(
    _prevState: ActionState,
    formData: FormData
  ) {
    return addReviewAction(workspace, taskId, formData);
  }

  const [state, formAction, pending] = useActionState(reviewFormAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet. Log progress or blockers.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              workspace={workspace}
              taskId={taskId}
            />
          ))}
        </ul>
      )}

      <form action={formAction} className="space-y-3 border-t border-border pt-5">
        <p className="text-sm font-medium text-foreground">Add review</p>
        <Input
          label="Date"
          name="review_date"
          type="date"
          defaultValue={today}
        />
        <Textarea
          label="Notes"
          name="comment"
          placeholder="What did you complete or learn?"
          required
        />

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.success && <p className="text-sm text-success">{state.success}</p>}

        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Saving..." : "Add review"}
        </Button>
      </form>
    </div>
  );
}

function ReviewItem({
  review,
  workspace,
  taskId,
}: {
  review: Review;
  workspace: Workspace;
  taskId: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteReviewAction(workspace, taskId, review.id);
    });
  }

  return (
    <li className="group rounded-lg border border-border bg-background/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          {formatReviewDate(review.review_date)}
        </p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="hidden h-7 w-7 items-center justify-center rounded text-muted hover:text-danger group-hover:inline-flex"
          aria-label="Delete review"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-sm text-foreground">{review.comment}</p>
    </li>
  );
}
