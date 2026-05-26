"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign in link has expired or has already been used.",
  OAuthSignin: "Error signing in with OAuth provider.",
  OAuthCallback: "Error in the OAuth callback.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailCreateAccount: "Could not create email account.",
  Callback: "Error in the callback handler.",
  OAuthAccountNotLinked: "This email is already linked to a different account.",
  EmailSignin: "The email could not be sent.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to access this page.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";

  return (
    <div className="glass rounded-2xl p-8 text-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 mx-auto">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="text-xl font-bold text-white">Authentication Error</h1>
      <p className="text-white/60 text-sm">
        {ERROR_MESSAGES[error] ?? "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex flex-col gap-3 pt-2">
        <Button variant="gold" asChild>
          <Link href="/auth/sign-in">Try Again</Link>
        </Button>
        <Button variant="hero" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-white/60 text-sm">Loading...</p>
          </div>
        }>
          <ErrorContent />
        </Suspense>
      </div>
    </div>
  );
}
