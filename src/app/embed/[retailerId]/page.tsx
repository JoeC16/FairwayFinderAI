import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { EmbedFittingStart } from "./embed-fitting-start";

export default async function EmbedPage({ params }: { params: Promise<{ retailerId: string }> }) {
  const { retailerId } = await params;

  const retailer = await db.retailer.findFirst({
    where: { OR: [{ slug: retailerId }, { id: retailerId }], active: true },
    include: { widgetConfig: true },
  });

  if (!retailer) notFound();

  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}>
        <EmbedFittingStart
          retailer={{
            id: retailer.id,
            name: retailer.name,
            primaryColor: retailer.widgetConfig?.primaryColor ?? retailer.primaryColor,
            welcomeTitle: retailer.widgetConfig?.welcomeTitle ?? null,
            welcomeText: retailer.widgetConfig?.welcomeText ?? null,
            ctaText: retailer.widgetConfig?.ctaText ?? null,
            showBranding: retailer.widgetConfig?.showBranding ?? true,
          }}
        />
      </body>
    </html>
  );
}
