"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, Check, Loader2 } from "lucide-react";

interface Props {
  sessionId: string;
  isSignedIn: boolean;
}

const INCLUDED = [
  "Specific club brand & model recommendations",
  "Full specs: loft, flex, shaft weight",
  "Bag gap analysis & chart",
  "Upgrade priority ranking",
  "Downloadable PDF report",
  "10 future fitting credits",
];

export function UnlockPaywall({ sessionId, isSignedIn }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(searchParams.get("unlocked") === "1");

  useEffect(() => {
    if (!polling) return;
    let attempts = 0;
    const guestToken = typeof window !== "undefined"
      ? sessionStorage.getItem(`fitting_token_${sessionId}`) ?? ""
      : "";

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/fitting/${sessionId}/unlock-status?token=${guestToken}`);
        const data = await res.json() as { unlocked?: boolean };
        if (data.unlocked) {
          clearInterval(interval);
          router.refresh();
          return;
        }
      } catch { /* ignore */ }
      if (attempts >= 10) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [polling, sessionId, router]);

  async function handleUnlock() {
    setLoading(true);
    setError("");
    const guestToken = typeof window !== "undefined"
      ? sessionStorage.getItem(`fitting_token_${sessionId}`) ?? ""
      : "";

    if (!isSignedIn) {
      const callbackUrl = encodeURIComponent(
        `/fitting/${sessionId}/results?guestToken=${guestToken}`
      );
      router.push(`/auth/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    // Claim guest session if applicable
    if (guestToken) {
      await fetch("/api/fitting/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, guestToken }),
      }).catch(() => {});
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "consumer_unlock", sessionId }),
    });
    const data = await res.json() as { url?: string; alreadyUnlocked?: boolean; error?: string };

    if (data.alreadyUnlocked) {
      router.refresh();
      return;
    }
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    setError(data.error ?? "Something went wrong. Please try again.");
    setLoading(false);
  }

  if (polling) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-gray-600 text-sm">Verifying your payment…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="relative">
        {/* Blurred placeholder rows to hint at hidden content */}
        <div className="select-none pointer-events-none" aria-hidden>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-4 h-20 bg-white rounded-2xl border border-gray-100 blur-sm opacity-40" />
          ))}
        </div>

        {/* Paywall card overlay */}
        <div className="absolute inset-0 flex items-start justify-center pt-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 w-full max-w-lg mx-4">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 mb-4">
                <Lock className="h-7 w-7 text-brand-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Unlock Your Full Report</h2>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-gray-900">£4.99</span>
                <span className="text-gray-400 text-sm">one-time</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">No subscription — pay once, keep your report forever</p>
            </div>

            <ul className="space-y-2 mb-6">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-brand-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleUnlock}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Redirecting…" : isSignedIn ? "Unlock Now — £4.99" : "Sign In to Unlock"}
            </Button>

            {!isSignedIn && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Free account required to complete purchase
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
