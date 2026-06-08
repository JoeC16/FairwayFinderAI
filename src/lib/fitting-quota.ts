import { db } from "@/lib/db";

export type QuotaResult =
  | { allowed: true }
  | { allowed: false; reason: "trial_expired" | "limit_reached" | "no_subscription" };

export async function checkFittingQuota(retailerId: string): Promise<QuotaResult> {
  const retailer = await db.retailer.findUnique({
    where: { id: retailerId },
    include: { subscription: true },
  });

  if (!retailer) return { allowed: false, reason: "no_subscription" };

  const sub = retailer.subscription;

  // No subscription record at all — treat as open trial (just created)
  if (!sub) return { allowed: true };

  // Trial expired
  if (sub.status === "trialing" && retailer.trialEndsAt && retailer.trialEndsAt < new Date()) {
    return { allowed: false, reason: "trial_expired" };
  }

  // Canceled or past_due
  if (sub.status === "canceled" || sub.status === "past_due") {
    return { allowed: false, reason: "trial_expired" };
  }

  // Fitting limit reached
  if (sub.fittingsUsed >= sub.fittingsLimit) {
    return { allowed: false, reason: "limit_reached" };
  }

  return { allowed: true };
}

export async function incrementFittingsUsed(retailerId: string) {
  await db.retailerSubscription.updateMany({
    where: { retailerId },
    data: { fittingsUsed: { increment: 1 } },
  });
}
