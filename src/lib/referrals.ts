import { db } from "@/lib/db";

const REF_COOKIE = "ff_ref";

export function referralCookieName() {
  return REF_COOKIE;
}

// Looks up an active partner by code; returns null for unknown/inactive codes
// so callers can silently ignore stale or tampered cookies.
export async function findActiveReferralPartner(code: string) {
  return db.referralPartner.findFirst({ where: { code, active: true } });
}

export async function recordReferralSignup(code: string, userId: string, userEmail: string) {
  const partner = await findActiveReferralPartner(code);
  if (!partner) return null;

  await db.referralConversion.create({
    data: { referralPartnerId: partner.id, userId, userEmail, type: "signup" },
  });
  return partner;
}

export async function recordReferralPayment(opts: {
  code: string;
  userId?: string;
  userEmail?: string;
  amountPence: number;
  stripeSessionId: string;
}) {
  const partner = await findActiveReferralPartner(opts.code);
  if (!partner) return null;

  const commissionPence = Math.round(opts.amountPence * partner.commissionRate);

  await db.referralConversion.upsert({
    where: { stripeSessionId: opts.stripeSessionId },
    update: {},
    create: {
      referralPartnerId: partner.id,
      userId: opts.userId,
      userEmail: opts.userEmail,
      type: "payment",
      amountPence: opts.amountPence,
      commissionPence,
      stripeSessionId: opts.stripeSessionId,
    },
  });
  return partner;
}
