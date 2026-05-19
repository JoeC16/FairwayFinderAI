import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateFittingReportPDF } from "@/lib/pdf/report-generator";

async function generateReport(req: Request, params: { sessionId: string }) {
  const session = await getServerSession(authOptions);
  const { sessionId } = await params;
  const url = new URL(req.url);
  const guestToken = url.searchParams.get("token") ?? req.headers.get("x-guest-token");

  const fittingSession = await db.fittingSession.findUnique({
    where: { id: sessionId },
    include: {
      playerProfile: true,
      fittingResult: true,
    },
  });

  if (!fittingSession) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Auth check: must be session owner, retailer, admin, or guest token holder
  const isOwner = session && fittingSession.userId === session.user.id;
  const isRetailer = session && fittingSession.retailerId && (session.user.role === "RETAILER" || session.user.role === "ADMIN");
  const isGuest = guestToken && fittingSession.guestToken === guestToken;

  if (!isOwner && !isRetailer && !isGuest) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!fittingSession.playerProfile || !fittingSession.fittingResult) {
    return NextResponse.json({ error: "Fitting not complete" }, { status: 400 });
  }

  const pdfBuffer = generateFittingReportPDF({
    session: fittingSession,
    profile: fittingSession.playerProfile,
    result: fittingSession.fittingResult as Parameters<typeof generateFittingReportPDF>[0]["result"],
  });

  const fileName = `fairwayfit-report-${fittingSession.playerProfile.name.replace(/\s+/g, "-").toLowerCase()}.pdf`;

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(pdfBuffer.length),
    },
  });
}

export function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  return params.then((p) => generateReport(req, p));
}

export function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  return params.then((p) => generateReport(req, p));
}
