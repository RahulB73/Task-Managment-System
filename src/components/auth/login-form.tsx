"use client";

import { useActionState } from "react";
import {
  signInWithEmail,
  signInWithGoogle,
  type AuthActionState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInWithEmail,
    initialState
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <Input
          label="Email"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />

        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending ? "Sending link..." : "Send magic link"}
        </Button>
      </form>

      {state.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
          {state.success}
        </p>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted">or</span>
        </div>
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="secondary" className="w-full" size="lg">
          Continue with Google
        </Button>
      </form>
    </div>
  );
}
