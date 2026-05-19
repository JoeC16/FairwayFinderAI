import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

const STATUS_COLORS: Record<string, "default" | "brand" | "success" | "warning" | "secondary"> = {
  NEW: "default",
  CONTACTED: "warning",
  QUALIFIED: "brand",
  CONVERTED: "success",
  LOST: "secondary",
};

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);

  const retailer = await db.retailer.findUnique({
    where: { userId: session!.user.id },
    select: { id: true },
  });

  if (!retailer) redirect("/auth/sign-up?role=retailer");

  const leads = await db.lead.findMany({
    where: { retailerId: retailer.id },
    orderBy: { createdAt: "desc" },
    include: {
      session: {
        include: {
          fittingResult: { select: { overallConfidence: true } },
          playerProfile: { select: { handicap: true } },
        },
      },
    },
  });

  const statusCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{leads.length} total leads</p>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-3">
        {(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const).map((status) => (
          <div key={status} className="bg-white border border-gray-100 rounded-xl px-4 py-2 flex items-center gap-2">
            <Badge variant={STATUS_COLORS[status]} className="text-xs capitalize">
              {status.toLowerCase()}
            </Badge>
            <span className="text-sm font-semibold text-gray-900">{statusCounts[status] ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No leads yet.</p>
            <p className="text-sm text-gray-400">Leads are automatically created when visitors complete a fitting on your widget.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Contact</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500">Handicap</th>
                <th className="px-5 py-3 font-medium text-gray-500">Confidence</th>
                <th className="px-5 py-3 font-medium text-gray-500">Source</th>
                <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <a href={`mailto:${lead.email}`} className="text-xs text-gray-400 hover:text-brand-700 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {lead.email}
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-xs text-gray-400 hover:text-brand-700 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={STATUS_COLORS[lead.status]} className="text-xs capitalize">
                      {lead.status.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {lead.session?.playerProfile?.handicap != null
                      ? `+${lead.session.playerProfile.handicap}` || String(lead.session.playerProfile.handicap)
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {lead.session?.fittingResult?.overallConfidence ? (
                      <span className="text-sm font-semibold text-brand-700">
                        {lead.session.fittingResult.overallConfidence}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs capitalize">{lead.source ?? "widget"}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    {lead.sessionId && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/fitting/${lead.sessionId}/results`}>View Fitting</Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
