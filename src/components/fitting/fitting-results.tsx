"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfidenceMeter } from "./confidence-meter";
import { RecommendationCard } from "./recommendation-card";
import { GapChart } from "./gap-chart";
import { PartnerRetailers } from "./partner-retailers";
import { UnlockPaywall } from "./unlock-paywall";
import {
  Download,
  Share2,
  ArrowLeft,
  Trophy,
  Target,
  BarChart3,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { cn, getConfidenceTier, getConfidenceTierLabel, getConfidenceTierColor, formatCurrency } from "@/lib/utils";
import type {
  DriverRecommendation,
  IronRecommendation,
  WedgeRecommendation,
  BagGapAnalysis,
  FullConfidenceReport,
  UpgradePriority,
} from "@/types/fitting";

interface FittingResultData {
  id: string;
  overallConfidence: number;
  confidenceScores: unknown;
  driverRec: unknown | null;
  ironRec: unknown | null;
  wedgeRec: unknown | null;
  shaftRec: unknown | null;
  lieLengthRec: unknown | null;
  bagGapAnalysis: unknown | null;
  upgradeOrder: unknown | null;
  aiSummary: string | null;
  pdfUrl: string | null;
}

interface Props {
  sessionId: string;
  playerName: string;
  result: FittingResultData;
  isUnlocked: boolean;
  isSignedIn: boolean;
}

function readGuestToken(sessionId: string): string {
  if (typeof window === "undefined") return "";
  const fromStorage = sessionStorage.getItem(`fitting_token_${sessionId}`);
  if (fromStorage) return fromStorage;
  const match = document.cookie.split(";").find((c) => c.trim().startsWith("ff_pending_claim="));
  if (match) {
    const value = match.split("=")[1]?.trim() ?? "";
    const [cookieSessionId, token] = value.split(":");
    if (cookieSessionId === sessionId && token) return token;
  }
  return "";
}

export function FittingResults({ sessionId, playerName, result, isUnlocked, isSignedIn }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [guestToken, setGuestToken] = useState("");

  useEffect(() => {
    setGuestToken(readGuestToken(sessionId));
  }, [sessionId]);

  const confidence = result.confidenceScores as FullConfidenceReport;
  const driverRec = result.driverRec as DriverRecommendation | null;
  const ironRec = result.ironRec as IronRecommendation | null;
  const wedgeRec = result.wedgeRec as WedgeRecommendation | null;
  const bagGaps = result.bagGapAnalysis as BagGapAnalysis | null;
  const upgrades = result.upgradeOrder as UpgradePriority[] | null;

  const overallTier = getConfidenceTier(result.overallConfidence);
  const tierLabel = getConfidenceTierLabel(overallTier);
  const tierColor = getConfidenceTierColor(overallTier);

  async function downloadPDF() {
    setDownloading(true);
    try {
      const token = readGuestToken(sessionId);
      const headers: Record<string, string> = {};
      if (token) headers["x-guest-token"] = token;
      const res = await fetch(`/api/fitting/${sessionId}/report`, { method: "POST", headers });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fairwayfit-report-${sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }

  const saveCallbackUrl = encodeURIComponent(
    `/fitting/${sessionId}/results${guestToken ? `?guestToken=${guestToken}` : ""}`
  );

  // ── TEASER MODE ───────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="gradient-hero px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-6 w-6 text-gold-400" />
                <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Analysis Complete</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {playerName}&apos;s Fitting Report
              </h1>
              <p className="text-white/60 mt-2">Your AI analysis is ready — unlock to see your full recommendations</p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-6">
                  <ConfidenceMeter score={result.overallConfidence} size="lg" />
                  <div>
                    <p className="text-white/60 text-sm">Overall Fit Confidence</p>
                    <p className={cn("text-xl font-bold mt-0.5", tierColor)}>{tierLabel}</p>
                    <p className="text-white/50 text-xs mt-1 max-w-xs leading-relaxed">
                      {confidence?.overall?.explanation}
                    </p>
                  </div>
                </div>
                <div className="sm:ml-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Driver", score: confidence?.driver?.score },
                    { label: "Irons", score: confidence?.irons?.score },
                    { label: "Wedges", score: confidence?.wedges?.score },
                    { label: "Bag Gaps", score: confidence?.bagGapping?.score },
                  ].map(({ label, score }) => (
                    <div key={label} className="glass-dark rounded-xl p-3 text-center">
                      <p className={cn("text-lg font-bold", getConfidenceTierColor(getConfidenceTier(score ?? 0)))}>
                        {score ?? 0}%
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {result.aiSummary && (
                <p className="text-white/70 text-sm mt-4 border-t border-white/10 pt-4 leading-relaxed">
                  {result.aiSummary}
                </p>
              )}
            </div>
          </div>
        </div>
        <UnlockPaywall sessionId={sessionId} isSignedIn={isSignedIn} />
      </div>
    );
  }

  // ── FULL REPORT MODE ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-hero px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link
            href={isSignedIn ? "/dashboard" : "/"}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {isSignedIn ? "Back to Dashboard" : "Back to Home"}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="h-6 w-6 text-gold-400" />
                <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">Fitting Complete</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {playerName}&apos;s Fitting Report
              </h1>
              <p className="text-white/60 mt-2">
                Personalised equipment recommendations based on your data
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <Button variant="hero" size="sm" onClick={downloadPDF} disabled={downloading} aria-label="Download PDF report">
                {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {downloading ? "Generating..." : "Download PDF"}
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Overall confidence */}
          <div className="mt-8 glass rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-center gap-6">
                <ConfidenceMeter score={result.overallConfidence} size="lg" />
                <div>
                  <p className="text-white/60 text-sm">Overall Fit Confidence</p>
                  <p className={cn("text-xl font-bold mt-0.5", tierColor)}>{tierLabel}</p>
                  <p className="text-white/50 text-xs mt-1 max-w-xs leading-relaxed">
                    {confidence?.overall?.explanation}
                  </p>
                </div>
              </div>

              <div className="sm:ml-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Driver", score: confidence?.driver?.score },
                  { label: "Irons", score: confidence?.irons?.score },
                  { label: "Wedges", score: confidence?.wedges?.score },
                  { label: "Bag Gaps", score: confidence?.bagGapping?.score },
                ].map(({ label, score }) => (
                  <div key={label} className="glass-dark rounded-xl p-3 text-center">
                    <p className={cn("text-lg font-bold", getConfidenceTierColor(getConfidenceTier(score ?? 0)))}>
                      {score ?? 0}%
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Upgrade Priorities */}
        {(upgrades?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-5 w-5 text-brand-700" />
              <h2 className="text-lg font-bold text-gray-900">Upgrade Priorities</h2>
            </div>
            <div className="space-y-3">
              {(upgrades ?? []).slice(0, 4).map((upgrade) => (
                <div key={upgrade.rank} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                    upgrade.priority === "high" ? "bg-brand-700" : upgrade.priority === "medium" ? "bg-gold-600" : "bg-gray-400"
                  )}>
                    {upgrade.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{upgrade.club}</span>
                      <Badge
                        variant={upgrade.priority === "high" ? "default" : "warning"}
                        className="text-xs"
                      >
                        {upgrade.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{upgrade.reasoning}</p>
                    <p className="text-xs text-brand-700 font-medium mt-1">{upgrade.expectedImprovement}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-700">{upgrade.estimatedCost}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Sections */}
        <Tabs defaultValue="driver" className="space-y-4">
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-white border border-gray-100 p-2 rounded-2xl">
            {[
              { value: "driver", label: "Driver" },
              { value: "irons", label: "Irons" },
              { value: "wedges", label: "Wedges" },
              { value: "shafts", label: "Shafts" },
              { value: "gaps", label: "Bag Gaps" },
            ].map(({ value, label }) => (
              <TabsTrigger key={value} value={value} className="flex-1 min-w-[80px]">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="driver">
            <DriverSection rec={driverRec} confidence={confidence?.driver?.score ?? 0} />
          </TabsContent>

          <TabsContent value="irons">
            <IronSection rec={ironRec} confidence={confidence?.irons?.score ?? 0} />
          </TabsContent>

          <TabsContent value="wedges">
            <WedgeSection rec={wedgeRec} confidence={confidence?.wedges?.score ?? 0} />
          </TabsContent>

          <TabsContent value="shafts">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shaft Recommendations</h2>
              <p className="text-gray-500 text-sm">
                Based on your swing speed profile, the following shafts are recommended.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="gaps">
            {bagGaps && <GapSection gaps={bagGaps} />}
          </TabsContent>
        </Tabs>

        {/* Missing data prompts */}
        {(confidence?.overall?.missingData?.length ?? 0) > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-900">Improve Your Confidence Score</h3>
            </div>
            <p className="text-sm text-amber-800 mb-3">
              Adding the following data would improve recommendation accuracy:
            </p>
            <ul className="space-y-1.5">
              {(confidence?.overall?.missingData ?? []).map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-amber-700">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="mt-4" asChild>
              <Link href={`/fitting/${sessionId}`}>Update Fitting Data</Link>
            </Button>
          </div>
        )}

        {/* Partner retailers */}
        <PartnerRetailers
          sessionId={sessionId}
          recommendedClubs={[
            driverRec?.recommendedProducts?.[0] && `${driverRec.recommendedProducts[0].brand} ${driverRec.recommendedProducts[0].model}`,
            ironRec?.recommendedProducts?.[0] && `${ironRec.recommendedProducts[0].brand} ${ironRec.recommendedProducts[0].model}`,
          ].filter(Boolean) as string[]}
        />

        {/* Bottom CTA — auth-aware */}
        <div className="gradient-hero rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            {isSignedIn ? "Save Your Full Report" : "Save this report to your account"}
          </h3>
          <p className="text-white/70 text-sm mb-6">
            {isSignedIn
              ? "Download your personalised PDF or save to your dashboard to revisit anytime."
              : "Create a free account to save this report, track your fittings, and access your results anytime."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gold" size="lg" onClick={downloadPDF} disabled={downloading}>
              <Download className="h-4 w-4" />
              Download Full Report
            </Button>
            {isSignedIn ? (
              <Button variant="hero" size="lg" asChild>
                <Link href="/dashboard">Save to Dashboard</Link>
              </Button>
            ) : (
              <Button variant="hero" size="lg" asChild>
                <Link href={`/auth/sign-up?callbackUrl=${saveCallbackUrl}`}>
                  Create Free Account
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DriverSection({ rec, confidence }: { rec: DriverRecommendation | null; confidence: number }) {
  if (!rec) return null;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Driver Fitting</h2>
          <ConfidenceMeter score={confidence} size="sm" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Loft", value: `${rec.loft}° (${rec.loftRange})` },
            { label: "Flex", value: rec.flex.replace("_", "-").toUpperCase() },
            { label: "Head Style", value: rec.headStyleLabel },
            { label: "Shaft Weight", value: rec.shaftWeight },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {rec.reasoning?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reasoning</p>
            {rec.reasoning.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {rec.recommendedProducts?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Recommended Products</h3>
          {rec.recommendedProducts.map((product, i) => (
            <RecommendationCard key={i} product={product} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function IronSection({ rec, confidence }: { rec: IronRecommendation | null; confidence: number }) {
  if (!rec) return null;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Iron Fitting</h2>
          <ConfidenceMeter score={confidence} size="sm" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Iron Type", value: rec.categoryLabel },
            { label: "Flex", value: rec.flex.replace("_", "-").toUpperCase() },
            { label: "Shaft Type", value: rec.shaftType === "steel" ? "Steel" : "Graphite" },
            { label: "Set Composition", value: rec.setComposition },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            { label: "Length Adjustment", value: rec.lengthAdjustment },
            { label: "Lie Adjustment", value: rec.lieAdjustment },
          ].map(({ label, value }) => (
            <div key={label} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">{label}</p>
              <p className="text-sm font-semibold text-blue-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        {rec.reasoning?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reasoning</p>
            {rec.reasoning.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {rec.recommendedProducts?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Recommended Products</h3>
          {rec.recommendedProducts.map((product, i) => (
            <RecommendationCard key={i} product={product} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function WedgeSection({ rec, confidence }: { rec: WedgeRecommendation | null; confidence: number }) {
  if (!rec) return null;
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Wedge Fitting</h2>
          <ConfidenceMeter score={confidence} size="sm" />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          {rec.setup?.map((wedge) => (
            <div key={wedge.loft} className="bg-gray-50 rounded-xl p-4 space-y-1">
              <p className="text-2xl font-bold text-brand-800">{wedge.loft}°</p>
              <p className="text-sm font-medium text-gray-700">{wedge.purpose}</p>
              <p className="text-xs text-gray-500">Bounce: {wedge.bounceAngle} ({wedge.bounce})</p>
              <p className="text-xs text-gray-500">Grind: {wedge.grindLabel}</p>
            </div>
          ))}
        </div>

        {rec.gapIssues?.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 mb-4 border border-amber-200">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Gap Issues Detected</p>
            {rec.gapIssues.map((issue, i) => (
              <p key={i} className="text-sm text-amber-800">{issue}</p>
            ))}
          </div>
        )}

        {rec.reasoning?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reasoning</p>
            {rec.reasoning.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {rec.recommendedProducts?.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Recommended Products</h3>
          {rec.recommendedProducts.map((product, i) => (
            <RecommendationCard key={i} product={product} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function GapSection({ gaps }: { gaps: BagGapAnalysis | null }) {
  if (!gaps) return null;
  const gradingColors = {
    excellent: "text-green-600",
    good: "text-emerald-600",
    fair: "text-amber-600",
    poor: "text-red-600",
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Bag Gap Analysis</h2>
          <span className={cn("text-base font-bold capitalize", gradingColors[gaps.overallGrading])}>
            {gaps.overallGrading}
          </span>
        </div>

        {gaps.chartData?.length > 0 && <GapChart data={gaps.chartData} />}

        {gaps.recommendations?.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recommendations</p>
            {gaps.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        )}
      </div>

      {gaps.gaps?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Detailed Gap Table</span>
          </div>
          <div className="divide-y divide-gray-50">
            {gaps.gaps.map((gap, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-28">{gap.fromClub}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm text-gray-500 w-28">{gap.toClub}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-sm font-semibold",
                    gap.severity === "optimal" ? "text-green-600" :
                    gap.severity === "acceptable" ? "text-gray-600" :
                    gap.severity === "concern" ? "text-amber-600" : "text-red-600"
                  )}>
                    {gap.gap}y gap
                  </span>
                  <Badge
                    variant={
                      gap.severity === "optimal" ? "success" :
                      gap.severity === "acceptable" ? "secondary" :
                      gap.severity === "concern" ? "warning" : "destructive"
                    }
                    className="text-xs"
                  >
                    {gap.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
