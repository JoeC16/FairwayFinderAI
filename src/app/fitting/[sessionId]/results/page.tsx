import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FittingResults } from "@/components/fitting/fitting-results";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function FittingResultsPage({ params }: Props) {
  const { sessionId } = await params;

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

  return (
    <FittingResults
      sessionId={sessionId}
      playerName={session.playerProfile?.name ?? "Golfer"}
      result={session.fittingResult}
    />
  );
}
