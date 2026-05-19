import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ retailerId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { retailerId } = await params;

    // Support both retailer ID and slug
    const retailer = await db.retailer.findFirst({
      where: {
        OR: [{ id: retailerId }, { slug: retailerId }],
        active: true,
      },
      include: {
        widgetConfig: true,
      },
    });

    if (!retailer) {
      return NextResponse.json({ error: "Retailer not found" }, { status: 404 });
    }

    // Check allowed domains
    const origin = req.headers.get("origin") ?? "";
    const widgetConfig = retailer.widgetConfig;
    if (widgetConfig?.allowedDomains?.length) {
      const isAllowed = widgetConfig.allowedDomains.some((domain) =>
        origin.includes(domain)
      );
      if (!isAllowed) {
        return NextResponse.json({ error: "Domain not authorized" }, { status: 403 });
      }
    }

    const config = {
      retailerId: retailer.id,
      retailerName: retailer.name,
      logoUrl: retailer.logoUrl,
      primaryColor: widgetConfig?.primaryColor ?? retailer.primaryColor,
      welcomeTitle: widgetConfig?.welcomeTitle ?? `Get Your Free Fitting at ${retailer.name}`,
      welcomeText: widgetConfig?.welcomeText ?? "Answer a few questions and get personalised club recommendations matched to our inventory.",
      ctaText: widgetConfig?.ctaText ?? "Start Free Fitting",
      showLogo: widgetConfig?.showLogo ?? true,
      showBranding: widgetConfig?.showBranding ?? true,
      collectLeads: widgetConfig?.collectLeads ?? true,
      requireEmail: widgetConfig?.requireEmail ?? true,
      redirectUrl: widgetConfig?.redirectUrl ?? null,
    };

    return NextResponse.json(config, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load widget config" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
