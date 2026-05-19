import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function AdminRetailersPage() {
  const retailers = await db.retailer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { select: { plan: true, status: true, fittingsUsed: true, fittingsLimit: true } },
      _count: { select: { fittingSessions: true, leads: true, inventory: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retailers</h1>
          <p className="text-gray-500 text-sm mt-1">{retailers.length} registered retailers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="px-5 py-3 font-medium text-gray-500">Retailer</th>
              <th className="px-5 py-3 font-medium text-gray-500">Plan</th>
              <th className="px-5 py-3 font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 font-medium text-gray-500">Fittings</th>
              <th className="px-5 py-3 font-medium text-gray-500">Leads</th>
              <th className="px-5 py-3 font-medium text-gray-500">Joined</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {retailers.map((retailer) => (
              <tr key={retailer.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{retailer.name}</p>
                  <p className="text-xs text-gray-400">{retailer.email} · /{retailer.slug}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant={retailer.plan === "ENTERPRISE" ? "gold" : "brand"}
                    className="text-xs capitalize"
                  >
                    {retailer.plan.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant={
                      retailer.subscription?.status === "active" ? "success" :
                      retailer.subscription?.status === "trialing" ? "warning" : "secondary"
                    }
                    className="text-xs"
                  >
                    {retailer.subscription?.status ?? "none"}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {retailer._count.fittingSessions}
                  {retailer.subscription && (
                    <span className="text-gray-400 text-xs"> / {retailer.subscription.fittingsLimit}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-600">{retailer._count.leads}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {format(new Date(retailer.createdAt), "MMM d, yyyy")}
                </td>
                <td className="px-5 py-3">
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/admin/retailers/${retailer.id}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {retailers.length === 0 && (
          <div className="p-12 text-center">
            <Store className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No retailers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
