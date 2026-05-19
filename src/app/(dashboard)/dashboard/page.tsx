import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trophy,
  Clock,
  FileText,
  ChevronRight,
  BarChart3,
  Target,
} from "lucide-react";
import { format } from "date-fns";
import { getConfidenceTier, getConfidenceTierLabel, getConfidenceTierColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const recentFittings = await db.fittingSession.findMany({
    where: { userId: session!.user.id, status: "COMPLETED" },
    include: {
      playerProfile: { select: { name: true, handicap: true } },
      fittingResult: { select: { overallConfidence: true, generatedAt: true, pdfUrl: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 5,
  });

  const inProgressFitting = await db.fittingSession.findFirst({
    where: { userId: session!.user.id, status: "IN_PROGRESS" },
    orderBy: { updatedAt: "desc" },
  });

  const totalFittings = recentFittings.length;
  const latestConfidence = recentFittings[0]?.fittingResult?.overallConfidence;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user.name?.split(" ")[0] ?? "Golfer"} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {totalFittings === 0
              ? "Start your first fitting to get personalised equipment recommendations."
              : `You have ${totalFittings} completed fitting${totalFittings === 1 ? "" : "s"}.`}
          </p>
        </div>
        <Button asChild>
          <Link href="/fitting">
            <Plus className="h-4 w-4" />
            New Fitting
          </Link>
        </Button>
      </div>

      {/* In-progress alert */}
      {inProgressFitting && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">You have an incomplete fitting</p>
              <p className="text-amber-700 text-xs mt-0.5">
                Started {format(new Date(inProgressFitting.createdAt), "MMM d")} — Step {inProgressFitting.currentStep} of 6
              </p>
            </div>
          </div>
          <Button size="sm" variant="default" asChild>
            <Link href={`/fitting/${inProgressFitting.id}`}>Continue</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Fittings Done",
            value: String(totalFittings),
            icon: Trophy,
            color: "text-brand-700",
            bg: "bg-brand-50",
          },
          {
            label: "Latest Confidence",
            value: latestConfidence ? `${latestConfidence}%` : "—",
            icon: Target,
            color: "text-gold-600",
            bg: "bg-gold-50",
          },
          {
            label: "PDF Reports",
            value: String(recentFittings.filter((f) => f.fittingResult?.pdfUrl).length),
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Avg Confidence",
            value: recentFittings.length
              ? `${Math.round(recentFittings.reduce((s, f) => s + (f.fittingResult?.overallConfidence ?? 0), 0) / recentFittings.length)}%`
              : "—",
            icon: BarChart3,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-4", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent fittings */}
      {recentFittings.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Fittings</h2>
            <Link href="/dashboard/fittings" className="text-sm text-brand-700 hover:text-brand-800 flex items-center gap-1">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentFittings.map((fitting) => {
              const confidence = fitting.fittingResult?.overallConfidence ?? 0;
              const tier = getConfidenceTier(confidence);
              return (
                <div key={fitting.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                      <Trophy className="h-5 w-5 text-brand-700" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {fitting.playerProfile?.name ?? "Fitting"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {fitting.completedAt ? format(new Date(fitting.completedAt), "MMM d, yyyy") : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {confidence > 0 && (
                      <Badge
                        variant={tier === "very_high" || tier === "high" ? "success" : tier === "moderate" ? "warning" : "secondary"}
                        className="hidden sm:flex"
                      >
                        {confidence}% {getConfidenceTierLabel(tier)}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" asChild>
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
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Trophy className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No fittings yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Start your first fitting to get personalised golf equipment recommendations.
          </p>
          <Button asChild>
            <Link href="/fitting">
              <Plus className="h-4 w-4" />
              Start Free Fitting
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
