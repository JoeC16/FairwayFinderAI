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
  if (!session || session.user.role !== "RETAILER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

  const { plan } = await req.json() as { plan: string };
  const priceId = PLAN_PRICE_IDS[plan?.toUpperCase()];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const retailer = await db.retailer.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  });
  if (!retailer) return NextResponse.json({ error: "Retailer not found" }, { status: 404 });

  // Get or create Stripe customer
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
  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/retailer/settings?upgraded=1`,
    cancel_url: `${appUrl}/retailer/settings`,
    metadata: { retailerId: retailer.id, plan: plan.toUpperCase() },
    subscription_data: {
      metadata: { retailerId: retailer.id, plan: plan.toUpperCase(), fittingsLimit: String(PLAN_LIMITS[plan.toUpperCase()] ?? 50) },
    },
  });

  return NextResponse.json({ url: checkout.url });
}
