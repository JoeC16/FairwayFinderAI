import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { subscriptionActiveEmail } from "@/lib/email/templates";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });

const PLAN_LIMITS: Record<string, number> = {
  STARTER: 50,
  PROFESSIONAL: 300,
  ENTERPRISE: 999999,
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.mode !== "subscription") break;

      const retailerId = cs.metadata?.retailerId;
      const plan = (cs.metadata?.plan ?? "STARTER") as keyof typeof PLAN_LIMITS;
      if (!retailerId) break;

      const subscription = await stripe.subscriptions.retrieve(cs.subscription as string);

      await db.retailerSubscription.upsert({
        where: { retailerId },
        update: {
          stripeCustomerId: cs.customer as string,
          stripeSubId: cs.subscription as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          status: "active",
          plan: plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
          fittingsLimit: PLAN_LIMITS[plan] ?? 50,
          currentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
        create: {
          retailerId,
          stripeCustomerId: cs.customer as string,
          stripeSubId: cs.subscription as string,
          stripePriceId: subscription.items.data[0]?.price.id,
          status: "active",
          plan: plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",
          fittingsLimit: PLAN_LIMITS[plan] ?? 50,
          currentPeriodEnd: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000),
        },
      });

      // Also update plan on the Retailer itself
      await db.retailer.update({
        where: { id: retailerId },
        data: { plan: plan as "STARTER" | "PROFESSIONAL" | "ENTERPRISE" },
      });

      // Send confirmation email
      const retailer = await db.retailer.findUnique({ where: { id: retailerId } });
      if (retailer) {
        await sendEmail({
          to: retailer.email,
          subject: "Subscription confirmed — FairwayFit AI",
          html: subscriptionActiveEmail(retailer.name, plan.charAt(0) + plan.slice(1).toLowerCase()),
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const retailerId = sub.metadata?.retailerId;
      if (!retailerId) break;

      await db.retailerSubscription.updateMany({
        where: { stripeSubId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await db.retailerSubscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { status: "canceled" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await db.retailerSubscription.updateMany({
          where: { stripeSubId: invoice.subscription as string },
          data: { status: "past_due" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
