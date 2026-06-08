"use client";

import { useState } from "react";
import { CreditCard, Loader2, Zap, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Props {
  plan: string;
  status: string;
  fittingsUsed: number;
  fittingsLimit: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free Trial",
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
  ENTERPRISE: "Enterprise",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return <Badge variant="success">Active</Badge>;
  if (status === "trialing") return <Badge variant="warning">Trial</Badge>;
  if (status === "past_due") return <Badge variant="destructive">Payment Failed</Badge>;
  if (status === "canceled") return <Badge variant="secondary">Canceled</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "active") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === "past_due") return <AlertCircle className="h-5 w-5 text-red-500" />;
  if (status === "canceled") return <XCircle className="h-5 w-5 text-gray-400" />;
  return <Zap className="h-5 w-5 text-amber-500" />;
}

export function BillingSection({ plan, status, fittingsUsed, fittingsLimit, currentPeriodEnd, cancelAtPeriodEnd, trialEndsAt }: Props) {
  const [loading, setLoading] = useState<"upgrade" | "portal" | null>(null);

  async function handleUpgrade() {
    setLoading("upgrade");
    try {
      const targetPlan = plan === "STARTER" || plan === "FREE" ? "PROFESSIONAL" : "STARTER";
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const { url } = await res.json() as { url: string };
      if (url) window.location.href = url;
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json() as { url: string };
      if (url) window.location.href = url;
    } finally {
      setLoading(null);
    }
  }

  const isTrialing = status === "trialing";
  const isActive = status === "active";
  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-gray-400" />
        <h2 className="font-semibold text-gray-900">Billing &amp; Plan</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Plan info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusIcon status={status} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{PLAN_LABELS[plan] ?? plan}</span>
                <StatusBadge status={status} />
              </div>
              {isTrialing && daysLeft !== null && (
                <p className="text-sm text-amber-600 mt-0.5">
                  {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining in trial` : "Trial has ended"}
                </p>
              )}
              {isActive && currentPeriodEnd && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {cancelAtPeriodEnd
                    ? `Cancels on ${format(new Date(currentPeriodEnd), "MMM d, yyyy")}`
                    : `Renews on ${format(new Date(currentPeriodEnd), "MMM d, yyyy")}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Usage bar */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-600">Fittings used this month</span>
            <span className="font-medium text-gray-900">
              {fittingsUsed} / {fittingsLimit === 999999 ? "Unlimited" : fittingsLimit}
            </span>
          </div>
          {fittingsLimit < 999999 && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, (fittingsUsed / fittingsLimit) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-1">
          {isActive ? (
            <Button variant="outline" onClick={handlePortal} disabled={loading !== null}>
              {loading === "portal" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Manage Billing
            </Button>
          ) : (
            <Button variant="default" onClick={handleUpgrade} disabled={loading !== null}>
              {loading === "upgrade" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Upgrade Plan
            </Button>
          )}
          {isActive && (plan === "STARTER" || plan === "FREE") && (
            <Button variant="outline" onClick={handleUpgrade} disabled={loading !== null}>
              {loading === "upgrade" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Upgrade to Professional
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
