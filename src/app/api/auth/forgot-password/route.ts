import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email/templates";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ ok: true }); // silent — don't reveal rate-limiting via different response shape
  }

  const { email } = await req.json() as { email: string };

  // Always return 200 to prevent user enumeration
  if (!email) return NextResponse.json({ ok: true });

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return NextResponse.json({ ok: true });

  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.upsert({
    where: { token },
    update: { token, expiresAt },
    create: { userId: user.id, token, expiresAt },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fairwayfit.ai";
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your FairwayFit AI password",
    html: passwordResetEmail(user.name ?? "there", resetUrl),
  });

  return NextResponse.json({ ok: true });
}
