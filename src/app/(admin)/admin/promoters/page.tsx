import { db } from "@/lib/db";
import { Megaphone } from "lucide-react";
import { CreatePromoterForm, PromoterActions } from "./actions";

export default async function AdminPromotersPage() {
  const promoters = await db.subscription.findMany({
    where: { promoterUntil: { not: null } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { promoterUntil: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Megaphone className="h-6 w-6 text-brand-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promoter Accounts</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create accounts for influencers with full free access</p>
        </div>
      </div>

      <CreatePromoterForm />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Promoters</h2>
          <span className="text-sm text-gray-400">{promoters.length} account{promoters.length !== 1 ? "s" : ""}</span>
        </div>

        {promoters.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No promoter accounts yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {promoters.map((p) => (
              <div key={p.userId} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{p.user.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{p.user.email}</p>
                </div>
                <PromoterActions promoter={{ ...p, promoterUntil: p.promoterUntil?.toISOString() ?? null }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
