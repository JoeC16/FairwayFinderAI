import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { FittingResults } from "@/components/fitting/fitting-results";

interface Props {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ guestToken?: string; unlocked?: string }>;
}

export default async function FittingResultsPage({ params, searchParams }: Props) {
  const { sessionId } = await params;
  const sp = await searchParams;
  const authSession = await getServerSession(authOptions);

  // Resolve guestToken from URL param first, then cookie fallback
  const cookieStore = await cookies();
  const pendingClaim = cookieStore.get("ff_pending_claim")?.value;
  const [claimSessionId, claimToken] = pendingClaim?.split(":") ?? [];
  const guestToken = sp.guestToken ?? (claimSessionId === sessionId ? claimToken : undefined);

  // Claim guest session transparently after sign-in redirect
  if (guestToken && authSession?.user) {
    const claimed = await db.fittingSession.updateMany({
      where: { id: sessionId, guestToken, userId: null },
      data: { userId: authSession.user.id },
    });
    if (claimed.count > 0) {
      redirect(`/fitting/${sessionId}/results`);
    }
  }

  const session = await db.fittingSession.findUnique({
    where: { id: sessionId },
    include: {
      playerProfile: true,
      fittingResult: {
        include: {
          productRecommendations: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!session?.fittingResult) {
    notFound();
  }

  const isUnlocked = session.resultsUnlocked || !!session.retailerId;
  const isSignedIn = !!authSession?.user;

  // Only pass sensitive recommendation data when unlocked
  const result = isUnlocked
    ? session.fittingResult
    : {
        id: session.fittingResult.id,
        overallConfidence: session.fittingResult.overallConfidence,
        confidenceScores: session.fittingResult.confidenceScores,
        aiSummary: session.fittingResult.aiSummary,
        driverRec: null,
        ironRec: null,
        wedgeRec: null,
        shaftRec: null,
        lieLengthRec: null,
        bagGapAnalysis: null,
        upgradeOrder: null,
        pdfUrl: null,
        productRecommendations: [],
      };

  return (
    <FittingResults
      sessionId={sessionId}
      playerName={session.playerProfile?.name ?? "Golfer"}
      result={result}
      isUnlocked={isUnlocked}
      isSignedIn={isSignedIn}
    />
  );
}
