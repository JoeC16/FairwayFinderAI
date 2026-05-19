import PDFDocument from "pdfkit";
import type { FittingResult, PlayerProfile, FittingSession } from "@prisma/client";

interface ReportData {
  session: FittingSession;
  profile: PlayerProfile;
  result: FittingResult & { driverRec?: unknown; ironRec?: unknown; wedgeRec?: unknown; bagGapAnalysis?: unknown };
}

function hexToRGB(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

const BRAND_GREEN = "#166534";
const GOLD = "#d97706";
const GRAY = "#6b7280";
const LIGHT_GRAY = "#f9fafb";

export function generateFittingReportPDF(data: ReportData): Buffer {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const { profile, result } = data;
  const confidence = result.overallConfidence;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 80).fill(BRAND_GREEN);
  doc.fontSize(22).fillColor("white").font("Helvetica-Bold")
    .text("FairwayFit AI", 48, 26);
  doc.fontSize(10).fillColor("rgba(255,255,255,0.7)").font("Helvetica")
    .text("Professional Club Fitting Report", 48, 52);

  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  doc.fontSize(10).fillColor("rgba(255,255,255,0.7)")
    .text(date, 0, 52, { align: "right", width: doc.page.width - 48 });

  doc.moveDown(3);

  // ── Player summary ───────────────────────────────────────────────────────
  doc.fontSize(16).fillColor(BRAND_GREEN).font("Helvetica-Bold")
    .text(`Fitting Report for ${profile.name}`);
  doc.fontSize(10).fillColor(GRAY).font("Helvetica").moveDown(0.3)
    .text(`Handicap: ${profile.handicap} · Height: ${profile.heightCm}cm · ${profile.dominantHand === "left" ? "Left" : "Right"} Handed`);

  doc.moveDown(1);

  // ── Confidence score ──────────────────────────────────────────────────────
  const tier = confidence >= 80 ? "Excellent" : confidence >= 65 ? "Good" : confidence >= 50 ? "Fair" : "Limited";
  const tierColor = confidence >= 80 ? "#16a34a" : confidence >= 65 ? GOLD : "#6b7280";

  doc.roundedRect(48, doc.y, doc.page.width - 96, 64, 8).fill(LIGHT_GRAY);
  const boxY = doc.y - 64;
  doc.fontSize(32).fillColor(tierColor).font("Helvetica-Bold")
    .text(`${confidence}%`, 64, boxY + 14, { continued: false });
  doc.fontSize(11).fillColor(GRAY).font("Helvetica")
    .text(`Fitting Confidence — ${tier}`, 64, boxY + 46);
  doc.fontSize(10).fillColor(GRAY).font("Helvetica")
    .text("Based on data completeness and measurement quality", doc.page.width / 2, boxY + 20, {
      width: doc.page.width / 2 - 64,
    });

  doc.moveDown(1.5);

  // ── Helper: section header ────────────────────────────────────────────────
  function sectionHeader(title: string) {
    doc.moveDown(0.5);
    doc.fontSize(13).fillColor(BRAND_GREEN).font("Helvetica-Bold").text(title);
    doc.moveTo(48, doc.y + 2).lineTo(doc.page.width - 48, doc.y + 2).stroke(BRAND_GREEN);
    doc.moveDown(0.5);
  }

  // Helper: key-value row
  function kv(key: string, value: string) {
    doc.fontSize(10).fillColor("#111827").font("Helvetica-Bold").text(key, { continued: true });
    doc.font("Helvetica").fillColor(GRAY).text(`  ${value}`);
  }

  // ── Driver recommendation ────────────────────────────────────────────────
  const driverRec = result.driverRec as {
    recommendedLoft?: number;
    shaftFlex?: string;
    headStyle?: string;
    recommendations?: { brand?: string; model?: string; loft?: string; reasoning?: string }[];
  } | null;

  if (driverRec) {
    sectionHeader("Driver Recommendation");
    kv("Recommended Loft:", `${driverRec.recommendedLoft ?? "—"}°`);
    kv("Shaft Flex:", driverRec.shaftFlex ?? "—");
    kv("Head Style:", driverRec.headStyle ?? "—");

    if (driverRec.recommendations?.[0]) {
      const top = driverRec.recommendations[0];
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#111827").font("Helvetica-Bold")
        .text(`Top Pick: ${top.brand ?? ""} ${top.model ?? ""} ${top.loft ?? ""}`);
      if (top.reasoning) {
        doc.fontSize(10).fillColor(GRAY).font("Helvetica").text(top.reasoning, { width: doc.page.width - 96 });
      }
    }
    doc.moveDown(0.5);
  }

  // ── Iron recommendation ───────────────────────────────────────────────────
  const ironRec = result.ironRec as {
    category?: string;
    lengthAdjustment?: number;
    lieAdjustment?: number;
    recommendations?: { brand?: string; model?: string; reasoning?: string }[];
  } | null;

  if (ironRec) {
    sectionHeader("Iron Recommendation");
    kv("Iron Category:", ironRec.category?.replace(/_/g, " ") ?? "—");
    if (ironRec.lengthAdjustment !== undefined && ironRec.lengthAdjustment !== 0) {
      kv("Length Adjustment:", `${ironRec.lengthAdjustment > 0 ? "+" : ""}${ironRec.lengthAdjustment}"`);
    }
    if (ironRec.lieAdjustment !== undefined && ironRec.lieAdjustment !== 0) {
      kv("Lie Angle:", `${ironRec.lieAdjustment > 0 ? "+" : ""}${ironRec.lieAdjustment}° ${ironRec.lieAdjustment > 0 ? "upright" : "flat"}`);
    }

    if (ironRec.recommendations?.[0]) {
      const top = ironRec.recommendations[0];
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#111827").font("Helvetica-Bold")
        .text(`Top Pick: ${top.brand ?? ""} ${top.model ?? ""}`);
      if (top.reasoning) {
        doc.fontSize(10).fillColor(GRAY).font("Helvetica").text(top.reasoning, { width: doc.page.width - 96 });
      }
    }
    doc.moveDown(0.5);
  }

  // ── Wedge recommendation ──────────────────────────────────────────────────
  const wedgeRec = result.wedgeRec as {
    setup?: { gapWedge?: number; sandWedge?: number; lobWedge?: number };
    bounce?: string;
    recommendations?: { brand?: string; model?: string; loft?: string }[];
  } | null;

  if (wedgeRec) {
    sectionHeader("Wedge Setup");
    if (wedgeRec.setup) {
      const s = wedgeRec.setup;
      const setup = [
        s.gapWedge && `${s.gapWedge}° GW`,
        s.sandWedge && `${s.sandWedge}° SW`,
        s.lobWedge && `${s.lobWedge}° LW`,
      ].filter(Boolean).join(" · ");
      kv("Recommended Setup:", setup);
    }
    if (wedgeRec.bounce) kv("Bounce Profile:", wedgeRec.bounce);
    doc.moveDown(0.5);
  }

  // ── Bag gap analysis ──────────────────────────────────────────────────────
  const bagGap = result.bagGapAnalysis as {
    overallGrade?: string;
    gaps?: { clubName?: string; gapYards?: number; severity?: string }[];
  } | null;

  if (bagGap) {
    sectionHeader("Bag Gap Analysis");
    kv("Overall Grade:", bagGap.overallGrade?.toUpperCase() ?? "—");
    const concerns = (bagGap.gaps ?? []).filter((g) => g.severity === "concern" || g.severity === "problem");
    if (concerns.length > 0) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor(GRAY).font("Helvetica")
        .text("Gaps requiring attention:");
      concerns.forEach((gap) => {
        doc.text(`  • ${gap.clubName ?? "?"}: ${gap.gapYards ?? "?"}yd gap (${gap.severity})`);
      });
    }
    doc.moveDown(0.5);
  }

  // ── Footer on all pages ───────────────────────────────────────────────────
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#d1d5db").font("Helvetica")
      .text(
        `FairwayFit AI · Confidential fitting report for ${profile.name} · Page ${i + 1} of ${pageCount}`,
        48,
        doc.page.height - 32,
        { align: "center", width: doc.page.width - 96 }
      );
  }

  doc.end();

  return Buffer.concat(chunks);
}
