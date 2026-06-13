"use client";

import { useActionState, useState } from "react";
import {
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle,
  type AuthActionState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function signInAction(_prev: AuthActionState, formData: FormData) {
    return signInWithPassword(_prev, formData);
  }

  async function signUpAction(_prev: AuthActionState, formData: FormData) {
    return signUpWithPassword(_prev, formData);
  }

  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    initialState
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    initialState
  );

  const state = mode === "signin" ? signInState : signUpState;
  const formAction = mode === "signin" ? signInFormAction : signUpFormAction;
  const pending = mode === "signin" ? signInPending : signUpPending;

  return (
    <div className="space-y-6">
      <div className="flex rounded-lg border border-border bg-background p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium motion-safe:transition-colors ${
            mode === "signin"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium motion-safe:transition-colors ${
            mode === "signup"
              ? "bg-primary text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          Sign up
        </button>
      </div>

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

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          placeholder="••••••••"
          minLength={6}
        />

        {mode === "signup" && (
          <Input
            label="Confirm password"
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="••••••••"
            minLength={6}
          />
        )}

        <Button type="submit" disabled={pending} className="w-full" size="lg">
          {pending
            ? mode === "signin"
              ? "Signing in..."
              : "Creating account..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
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
