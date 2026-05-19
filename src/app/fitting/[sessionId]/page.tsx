import { FittingWizard } from "@/components/fitting/fitting-wizard";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function FittingSessionPage({ params }: Props) {
  const { sessionId } = await params;
  return <FittingWizard sessionId={sessionId} />;
}
