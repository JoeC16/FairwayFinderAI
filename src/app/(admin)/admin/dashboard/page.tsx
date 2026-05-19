import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Store, Trophy, TrendingUp, ChevronRight, AlertCircle } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  const [totalUsers, totalRetailers, totalFittings, recentUsers, recentRetailers] = await Promise.all([
    db.user.count(),
    db.retailer.count(),
    db.fittingSession.count({ where: { status: "COMPLETED" } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    db.retailer.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        subscription: { select: { status: true, plan: true } },
        _count: { select: { fittingSessions: true, leads: true } },
      },
    }),
  ]);

  const weeklyFittings = await db.fittingSession.count({
    where: { status: "COMPLETED", completedAt: { gte: subDays(new Date(), 7) } },
  });

  const weeklySignups = await db.user.count({
    where: { createdAt: { gte: subDays(new Date(), 7) } },
  });

  const stats = [
    { label: "Total Users", value: totalUsers, sub: `+${weeklySignups} this week`, icon: Users, color: "text-brand-700", bg: "bg-brand-50" },
    { label: "Active Retailers", value: totalRetailers, sub: "shops using platform", icon: Store, color: "text-gold-600", bg: "bg-gold-50" },
    { label: "Fittings Completed", value: totalFittings, sub: `+${weeklyFittings} this week`, icon: Trophy, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Conversion Rate", value: "—", sub: "fittings → leads", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview — {format(new Date(), "MMMM d, yyyy")}</p>
        </div>
        <Badge variant="destructive" className="text-xs">Admin Only</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
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
        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Sign-ups</h2>
            <Link href="/admin/users" className="text-sm text-brand-700 hover:text-brand-800 flex items-center gap-1">
              All users <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={user.role === "ADMIN" ? "destructive" : user.role === "RETAILER" ? "brand" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {user.role.toLowerCase()}
                  </Badge>
                  <span className="text-xs text-gray-400">{format(new Date(user.createdAt), "MMM d")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent retailers */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Retailers</h2>
            <Link href="/admin/retailers" className="text-sm text-brand-700 hover:text-brand-800 flex items-center gap-1">
              All retailers <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRetailers.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No retailers yet.</p>
              </div>
            ) : recentRetailers.map((retailer) => (
              <div key={retailer.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{retailer.name}</p>
                  <p className="text-xs text-gray-400">
                    {retailer._count.fittingSessions} fittings · {retailer._count.leads} leads
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={retailer.plan === "ENTERPRISE" ? "gold" : "brand"}
                    className="text-xs capitalize"
                  >
                    {retailer.plan.toLowerCase()}
                  </Badge>
                  <Badge
                    variant={retailer.subscription?.status === "trialing" ? "warning" : "success"}
                    className="text-xs"
                  >
                    {retailer.subscription?.status ?? "active"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Manage Users", href: "/admin/users", icon: Users },
          { label: "Manage Retailers", href: "/admin/retailers", icon: Store },
          { label: "Product Database", href: "/admin/products", icon: Trophy },
          { label: "Platform Analytics", href: "/admin/analytics", icon: TrendingUp },
        ].map(({ label, href, icon: Icon }) => (
          <Button key={label} variant="outline" className="h-16 flex flex-col gap-1" asChild>
            <Link href={href}>
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
