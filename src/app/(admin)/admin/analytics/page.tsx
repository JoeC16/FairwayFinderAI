import { db } from "@/lib/db";
import { subDays, format, eachDayOfInterval } from "date-fns";
import { BarChart3 } from "lucide-react";
import { RetailerAnalyticsChart } from "@/app/(retailer)/retailer/analytics/analytics-chart";

export default async function AdminAnalyticsPage() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const [totalFittings, totalUsers, fittingsByDay] = await Promise.all([
    db.fittingSession.count({ where: { status: "COMPLETED" } }),
    db.user.count(),
    db.fittingSession.groupBy({
      by: ["completedAt"],
      where: { status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } },
      _count: { _all: true },
    }),
  ]);

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

  const fittings30d = chartData.reduce((s, d) => s + d.fittings, 0);
  const users30d = await db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Last 30 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Fittings", value: totalFittings },
          { label: "Fittings (30d)", value: fittings30d },
          { label: "Total Users", value: totalUsers },
          { label: "New Users (30d)", value: users30d },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Platform-wide Fittings Per Day (30 days)</h2>
        <RetailerAnalyticsChart data={chartData} />
      </div>
    </div>
  );
}
