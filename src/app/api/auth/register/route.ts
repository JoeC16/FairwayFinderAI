import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email/templates";
import { referralCookieName, recordReferralSignup } from "@/lib/referrals";
import { rateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["consumer", "retailer"]).default("consumer"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests — try again in 15 minutes" }, { status: 429 });
  }

  try {
    const body = await req.json() as unknown;
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const cookieStore = await cookies();
    const refCode = cookieStore.get(referralCookieName())?.value;

    const user = await db.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: role === "retailer" ? "RETAILER" : "CONSUMER",
        referralCode: refCode || undefined,
        subscription: {
          create: {
            plan: "free",
            status: "active",
          },
        },
      },
    });

    if (refCode) {
      await recordReferralSignup(refCode, user.id, user.email);
    }

    await sendEmail({
      to: email,
      subject: `Welcome to FairwayFit AI`,
      html: welcomeEmail(name, role === "retailer" ? "RETAILER" : "CONSUMER"),
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
