import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Trophy, Target } from "lucide-react";
import { subDays, format, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { RetailerAnalyticsChart } from "./analytics-chart";

export default async function RetailerAnalyticsPage() {
  const session = await getServerSession(authOptions);

  const retailer = await db.retailer.findUnique({
    where: { userId: session!.user.id },
    select: { id: true, name: true },
  });

  if (!retailer) redirect("/auth/sign-up?role=retailer");

  const thirtyDaysAgo = subDays(new Date(), 30);

  const [fittings30d, leads30d, totalFittings, totalLeads, convertedLeads, fittingsByDay] = await Promise.all([
    db.fittingSession.count({
      where: { retailerId: retailer.id, status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
    }),
    db.lead.count({
      where: { retailerId: retailer.id, createdAt: { gte: thirtyDaysAgo } },
    }),
    db.fittingSession.count({ where: { retailerId: retailer.id, status: "COMPLETED" } }),
    db.lead.count({ where: { retailerId: retailer.id } }),
    db.lead.count({ where: { retailerId: retailer.id, status: "CONVERTED" } }),
    db.fittingSession.groupBy({
      by: ["completedAt"],
      where: { retailerId: retailer.id, status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
    }),
  ]);

  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Build chart data with all days
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
  const fittingMap = new Map<string, number>();
  fittingsByDay.forEach((row) => {
    if (row.completedAt) {
      const key = format(new Date(row.completedAt), "MMM d");
      fittingMap.set(key, (fittingMap.get(key) ?? 0) + row._count._all);
    }
  });
  const chartData = days.map((day) => ({
    date: format(day, "MMM d"),
    fittings: fittingMap.get(format(day, "MMM d")) ?? 0,
  }));

  // Recent fitting results with confidence
  const recentResults = await db.fittingSession.findMany({
    where: { retailerId: retailer.id, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 20,
    include: {
      fittingResult: { select: { overallConfidence: true } },
      playerProfile: { select: { handicap: true } },
    },
  });

  const avgConfidence = recentResults.length > 0
    ? Math.round(recentResults.reduce((s, f) => s + (f.fittingResult?.overallConfidence ?? 0), 0) / recentResults.length)
    : 0;

  const stats = [
    { label: "Fittings (30d)", value: fittings30d, icon: Trophy, color: "text-brand-700", bg: "bg-brand-50" },
    { label: "Leads (30d)", value: leads30d, icon: Users, color: "text-gold-600", bg: "bg-gold-50" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Avg Confidence", value: avgConfidence ? `${avgConfidence}%` : "—", icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Last 30 days performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-4", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Fittings Per Day (30 days)</h2>
        <RetailerAnalyticsChart data={chartData} />
      </div>

      {/* All-time summary */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Total Fittings", value: totalFittings },
          { label: "Total Leads", value: totalLeads },
          { label: "Converted Leads", value: convertedLeads },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-4xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-sm mt-2">{label} (all time)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
