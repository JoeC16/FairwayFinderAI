import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, ChevronRight, FileText } from "lucide-react";
import { format } from "date-fns";
import { getConfidenceTier, getConfidenceTierLabel } from "@/lib/utils";

export default async function FittingsPage() {
  const session = await getServerSession(authOptions);

  const fittings = await db.fittingSession.findMany({
    where: { userId: session!.user.id, status: "COMPLETED" },
    include: {
      playerProfile: { select: { name: true, handicap: true } },
      fittingResult: { select: { overallConfidence: true, generatedAt: true, pdfUrl: true } },
    },
    orderBy: { completedAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fittings</h1>
          <p className="text-gray-500 text-sm mt-1">{fittings.length} completed fittings</p>
        </div>
        <Button asChild>
          <Link href="/fitting">
            <Plus className="h-4 w-4" />
            New Fitting
          </Link>
        </Button>
      </div>

      {fittings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Trophy className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No fittings yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start a fitting to get personalised equipment recommendations.</p>
          <Button asChild>
            <Link href="/fitting">
              <Plus className="h-4 w-4" />
              Start Free Fitting
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {fittings.map((fitting) => {
              const confidence = fitting.fittingResult?.overallConfidence ?? 0;
              const tier = getConfidenceTier(confidence);
              return (
                <div key={fitting.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                      <Trophy className="h-6 w-6 text-brand-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {fitting.playerProfile?.name ?? "Fitting"} — HCP {fitting.playerProfile?.handicap ?? "—"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {fitting.completedAt ? format(new Date(fitting.completedAt), "MMMM d, yyyy") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {confidence > 0 && (
                      <Badge
                        variant={tier === "very_high" || tier === "high" ? "success" : tier === "moderate" ? "warning" : "secondary"}
                      >
                        {confidence}% {getConfidenceTierLabel(tier)}
                      </Badge>
                    )}
                    {fitting.fittingResult?.pdfUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={fitting.fittingResult.pdfUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" />
                          PDF
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="default" asChild>
                      <Link href={`/fitting/${fitting.id}/results`}>
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
