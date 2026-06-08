"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function NewFittingRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retailerId = searchParams.get("retailer");

  useEffect(() => {
    async function createSession() {
      try {
        const res = await fetch("/api/fitting/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            retailerId: retailerId ?? undefined,
            source: retailerId ? "widget" : "direct",
          }),
        });

        if (!res.ok) throw new Error("Failed to create session");
        const { sessionId, guestToken } = await res.json() as { sessionId: string; guestToken: string };

        sessionStorage.setItem(`fitting_token_${sessionId}`, guestToken);
        router.push(`/fitting/${sessionId}`);
      } catch (err) {
        console.error(err);
        router.push("/");
      }
    }

    createSession();
  }, [retailerId, router]);

  return null;
}

export default function NewFittingPage() {
  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 text-gold-400 animate-spin mx-auto mb-4" />
        <p className="text-white/80 text-lg font-medium">Setting up your fitting session...</p>
      </div>
      <Suspense>
        <NewFittingRedirect />
      </Suspense>
    </div>
  );
}
