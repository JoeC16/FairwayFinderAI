import { db } from "@/lib/db";
import { RetailersAdminClient } from "./retailers-admin-client";

export default async function AdminRetailersPage() {
  const [retailers, partners] = await Promise.all([
    db.retailer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscription: { select: { plan: true, status: true, fittingsUsed: true, fittingsLimit: true } },
        _count: { select: { fittingSessions: true, leads: true, inventory: true } },
      },
    }),
    db.externalPartner.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <RetailersAdminClient
      retailers={retailers.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        slug: r.slug,
        plan: r.plan,
        active: r.active,
        inventoryCount: r._count.inventory,
        fittingsCount: r._count.fittingSessions,
        leadsCount: r._count.leads,
        subscriptionStatus: r.subscription?.status ?? null,
        fittingsLimit: r.subscription?.fittingsLimit ?? null,
        createdAt: r.createdAt.toISOString(),
      }))}
      partners={partners.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        tagline: p.tagline,
        website: p.website,
        searchUrlTemplate: p.searchUrlTemplate,
        accentColor: p.accentColor,
        bgColor: p.bgColor,
        initials: p.initials,
        countries: p.countries,
        active: p.active,
        sortOrder: p.sortOrder,
        scraperEnabled: p.scraperEnabled,
        scraperType: p.scraperType,
      }))}
    />
  );
}
