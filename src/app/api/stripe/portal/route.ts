import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "RETAILER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

  const retailer = await db.retailer.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  });

  const customerId = retailer?.subscription?.stripeCustomerId;
  if (!customerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fairwayfit.ai";
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/retailer/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
