import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TrialBanner } from "@/components/retailer/trial-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  BarChart3,
  TrendingUp,
  ChevronRight,
  Settings,
  Code,
  Trophy,
  Clock,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export default async function RetailerDashboardPage() {
  const session = await getServerSession(authOptions);

  const retailer = await db.retailer.findUnique({
    where: { userId: session!.user.id },
    include: {
      subscription: true,
      _count: {
        select: {
          fittingSessions: true,
          leads: true,
          inventory: true,
        },
      },
    },
  });

  if (!retailer) redirect("/auth/sign-up?role=retailer");

  const last7Days = subDays(new Date(), 7);
  const recentFittings = await db.fittingSession.findMany({
    where: { retailerId: retailer.id, status: "COMPLETED" },
    include: {
      playerProfile: { select: { name: true, email: true, handicap: true } },
      fittingResult: { select: { overallConfidence: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 8,
  });

  const recentLeads = await db.lead.findMany({
    where: { retailerId: retailer.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const weeklyFittings = await db.fittingSession.count({
    where: {
      retailerId: retailer.id,
      status: "COMPLETED",
      completedAt: { gte: last7Days },
    },
  });

  const newLeads = await db.lead.count({
    where: { retailerId: retailer.id, status: "NEW" },
  });

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL}/widget.js" data-retailer="${retailer.slug}"></script>\n<div id="fairwayfit-widget"></div>`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <TrialBanner
        status={retailer.subscription?.status ?? "trialing"}
        trialEndsAt={retailer.trialEndsAt?.toISOString() ?? null}
        fittingsUsed={retailer.subscription?.fittingsUsed ?? 0}
        fittingsLimit={retailer.subscription?.fittingsLimit ?? 50}
        plan={retailer.plan}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{retailer.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={retailer.plan === "ENTERPRISE" ? "gold" : "brand"} className="capitalize text-xs">
              {retailer.plan.toLowerCase()} plan
            </Badge>
            {retailer.subscription?.status === "trialing" && (
              <Badge variant="warning" className="text-xs">
                Trial ends {retailer.trialEndsAt ? format(new Date(retailer.trialEndsAt), "MMM d") : "soon"}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/retailer/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/retailer/inventory">
              <Package className="h-4 w-4" />
              Manage Inventory
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Fittings",
            value: String(retailer._count.fittingSessions),
            sub: `+${weeklyFittings} this week`,
            icon: Trophy,
            color: "text-brand-700",
            bg: "bg-brand-50",
          },
          {
            label: "Total Leads",
            value: String(retailer._count.leads),
            sub: `${newLeads} new`,
            icon: Users,
            color: "text-gold-600",
            bg: "bg-gold-50",
          },
          {
            label: "Inventory Items",
            value: String(retailer._count.inventory),
            sub: "products listed",
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Avg Confidence",
            value: recentFittings.length
              ? `${Math.round(recentFittings.reduce((s, f) => s + (f.fittingResult?.overallConfidence ?? 0), 0) / recentFittings.length)}%`
              : "—",
            sub: "fitting quality",
            icon: BarChart3,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-4", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Fittings */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Fittings</h2>
            <Link href="/retailer/analytics" className="text-sm text-brand-700 hover:text-brand-800 flex items-center gap-1">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentFittings.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No fittings yet. Share your widget to get started.</p>
              </div>
            ) : recentFittings.map((fitting) => (
              <div key={fitting.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{fitting.playerProfile?.name ?? "Anonymous"}</p>
                  <p className="text-xs text-gray-400">{fitting.playerProfile?.email} • HCP {fitting.playerProfile?.handicap}</p>
                </div>
                <div className="flex items-center gap-2">
                  {fitting.fittingResult?.overallConfidence && (
                    <span className="text-xs font-semibold text-brand-700">
                      {fitting.fittingResult.overallConfidence}%
                    </span>
                  )}
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/fitting/${fitting.id}/results`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Leads</h2>
            <Link href="/retailer/leads" className="text-sm text-brand-700 hover:text-brand-800 flex items-center gap-1">
              Manage <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No leads yet.</p>
              </div>
            ) : recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-400">{lead.email}</p>
                </div>
                <Badge
                  variant={
                    lead.status === "NEW" ? "default" :
                    lead.status === "CONVERTED" ? "success" :
                    lead.status === "QUALIFIED" ? "brand" : "secondary"
                  }
                  className="text-xs capitalize"
                >
                  {lead.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-brand-900 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500 shrink-0">
            <Code className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Widget Embed Code</h3>
            <p className="text-white/60 text-sm mt-0.5 mb-4">Add this to your website to embed the fitting tool</p>
            <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
              <pre>{embedCode}</pre>
            </div>
            <Button size="sm" variant="gold" className="mt-4" asChild>
              <Link href="/retailer/settings">Customise Widget</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
