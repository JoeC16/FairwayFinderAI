import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FittingResults } from "@/components/fitting/fitting-results";

interface Props {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ guestToken?: string; unlocked?: string }>;
}

export default async function FittingResultsPage({ params, searchParams }: Props) {
  const { sessionId } = await params;
  const sp = await searchParams;
  const authSession = await getServerSession(authOptions);

  // Claim guest session transparently after sign-in redirect
  if (sp.guestToken && authSession?.user) {
    await db.fittingSession.updateMany({
      where: { id: sessionId, guestToken: sp.guestToken, userId: null },
      data: { userId: authSession.user.id },
    });
    redirect(`/fitting/${sessionId}/results`);
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
