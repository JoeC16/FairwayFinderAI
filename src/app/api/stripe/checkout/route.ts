import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  STARTER: process.env.STRIPE_PRICE_RETAILER_STARTER,
  PROFESSIONAL: process.env.STRIPE_PRICE_RETAILER_PROFESSIONAL,
  ENTERPRISE: process.env.STRIPE_PRICE_RETAILER_ENTERPRISE,
};

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 50,
  PROFESSIONAL: 300,
  ENTERPRISE: 999999,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });
  const body = await req.json() as { plan?: string; type?: string; sessionId?: string };
  const { plan, type, sessionId } = body;

  // ── Consumer one-time unlock ──────────────────────────────────────────────
  if (type === "consumer_unlock") {
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }
    const priceId = process.env.STRIPE_PRICE_CONSUMER_UNLOCK;
    if (!priceId) {
      return NextResponse.json({ error: "Consumer unlock not configured" }, { status: 500 });
    }

    const fitting = await db.fittingSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
    });
    if (!fitting) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (fitting.resultsUnlocked) {
      return NextResponse.json({ alreadyUnlocked: true });
    }

    const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
    let customerId = sub?.stripeCustomerId ?? undefined;
    if (!customerId) {
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      const customer = await stripe.customers.create({
        email: user?.email ?? session.user.email!,
        name: user?.name ?? undefined,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      if (sub) {
        await db.subscription.update({
          where: { userId: session.user.id },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fairwayfit.ai";
    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/fitting/${sessionId}/results?unlocked=1`,
      cancel_url: `${appUrl}/fitting/${sessionId}/results`,
      metadata: { type: "consumer_unlock", userId: session.user.id, sessionId },
      payment_intent_data: {
        metadata: { type: "consumer_unlock", userId: session.user.id, sessionId },
      },
    });
    return NextResponse.json({ url: checkout.url });
  }

  // ── Retailer subscription ─────────────────────────────────────────────────
  if (!session || session.user.role !== "RETAILER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const retailerPriceId = PLAN_PRICE_IDS[(plan ?? "").toUpperCase()];
  if (!retailerPriceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const retailer = await db.retailer.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  });
  if (!retailer) return NextResponse.json({ error: "Retailer not found" }, { status: 404 });

  let customerId = retailer.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: retailer.email,
      name: retailer.name,
      metadata: { retailerId: retailer.id },
    });
    customerId = customer.id;
    if (retailer.subscription) {
      await db.retailerSubscription.update({
        where: { retailerId: retailer.id },
        data: { stripeCustomerId: customerId },
      });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fairwayfit.ai";
  const planKey = (plan ?? "STARTER").toUpperCase();
  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: retailerPriceId, quantity: 1 }],
    success_url: `${appUrl}/retailer/settings?upgraded=1`,
    cancel_url: `${appUrl}/retailer/settings`,
    metadata: { retailerId: retailer.id, plan: planKey },
    subscription_data: {
      metadata: { retailerId: retailer.id, plan: planKey, fittingsLimit: String(PLAN_LIMITS[planKey] ?? 50) },
    },
  });

  return NextResponse.json({ url: checkout.url });
}
