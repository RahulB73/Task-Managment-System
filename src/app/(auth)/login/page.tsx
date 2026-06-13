import { PageHeader } from "@/components/layout/page-header";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";

const ERROR_MESSAGES: Record<string, string> = {
  callback: "Sign-in failed. Please try again.",
  google: "Google sign-in is unavailable. Enable it in Supabase or use email.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : null;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8">
          <PageHeader
            title="Sign in"
            description="Use your email and password on any device."
            className="border-none px-0 py-0"
          />

          {errorMessage && (
            <p className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {errorMessage}
            </p>
          )}

          <div className="mt-8">
            <LoginForm />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
