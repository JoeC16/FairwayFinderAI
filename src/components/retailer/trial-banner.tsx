"use client";

import { useState } from "react";
import { AlertCircle, X, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  trialEndsAt: string | null;
  fittingsUsed: number;
  fittingsLimit: number;
  plan: string;
}

export function TrialBanner({ status, trialEndsAt, fittingsUsed, fittingsLimit, plan }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const isActive = status === "active";
  if (isActive || dismissed) return null;

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  const isExpired = status === "trialing" && daysLeft !== null && daysLeft === 0;
  const isPastDue = status === "past_due";
  const isCanceled = status === "canceled";
  const isLimitReached = fittingsUsed >= fittingsLimit;

  const urgent = isExpired || isPastDue || isCanceled || isLimitReached;

  let message = "";
  if (isCanceled) message = "Your subscription has been cancelled. Upgrade to continue.";
  else if (isPastDue) message = "Your last payment failed. Update your billing details to continue.";
  else if (isExpired) message = "Your free trial has ended. Upgrade to keep using FairwayFit AI.";
  else if (isLimitReached) message = `You've used all ${fittingsLimit} fittings this month. Upgrade for more.`;
  else if (daysLeft !== null) message = `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left on your free trial — ${fittingsUsed}/${fittingsLimit} fittings used.`;
  else message = `Free trial active — ${fittingsUsed}/${fittingsLimit} fittings used.`;

  async function handleUpgrade() {
    setLoading(true);
    try {
      const targetPlan = plan === "STARTER" ? "PROFESSIONAL" : "STARTER";
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const { url } = await res.json() as { url: string };
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn(
      "rounded-xl border px-4 py-3 flex items-center gap-3",
      urgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
    )}>
      <AlertCircle className={cn("h-4 w-4 shrink-0", urgent ? "text-red-500" : "text-amber-600")} />
      <p className={cn("text-sm flex-1", urgent ? "text-red-700" : "text-amber-800")}>{message}</p>
      <Button size="sm" variant="gold" onClick={handleUpgrade} disabled={loading} className="shrink-0">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Zap className="h-3.5 w-3.5" />Upgrade</>}
      </Button>
      {!urgent && (
        <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-600 shrink-0">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
