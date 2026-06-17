import { db } from "@/lib/db";
import { Link2 } from "lucide-react";
import { CreateReferralPartnerForm, ReferralPartnerActions } from "./actions";

export default async function AdminReferralsPage() {
  const partners = await db.referralPartner.findMany({
    include: { conversions: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = partners.map((p) => {
    const signups = p.conversions.filter((c) => c.type === "signup").length;
    const payments = p.conversions.filter((c) => c.type === "payment");
    const totalAmountPence = payments.reduce((sum, c) => sum + (c.amountPence ?? 0), 0);
    const totalCommissionPence = payments.reduce((sum, c) => sum + (c.commissionPence ?? 0), 0);

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      email: p.email,
      commissionRate: p.commissionRate,
      active: p.active,
      signups,
      payments: payments.length,
      totalAmountPence,
      totalCommissionPence,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link2 className="h-6 w-6 text-brand-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Partners</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track influencer codes/links, signups, and commission owed</p>
        </div>
      </div>

      <CreateReferralPartnerForm />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">All Partners</h2>
          <span className="text-sm text-gray-400">{rows.length} partner{rows.length !== 1 ? "s" : ""}</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No referral partners yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rows.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{p.name} <span className="text-gray-400 font-normal">— {p.code}</span></p>
                  <p className="text-xs text-gray-400">
                    {p.signups} signup{p.signups !== 1 ? "s" : ""} · {p.payments} payment{p.payments !== 1 ? "s" : ""} ·
                    {" "}£{(p.totalAmountPence / 100).toFixed(2)} revenue · £{(p.totalCommissionPence / 100).toFixed(2)} commission owed
                  </p>
                </div>
                <ReferralPartnerActions partner={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
