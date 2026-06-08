import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// One-time bootstrap: promotes a user to ADMIN.
// Only works when zero ADMIN accounts exist in the database.
// Permanently disabled once the first admin is created.
export async function POST(req: NextRequest) {
  const adminCount = await db.user.count({ where: { role: "ADMIN" } });

  if (adminCount > 0) {
    return NextResponse.json(
      { error: "An admin account already exists. This endpoint is disabled." },
      { status: 403 }
    );
  }

  const { email } = await req.json() as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "No account found with that email. Sign up first." },
      { status: 404 }
    );
  }

  await db.user.update({ where: { email }, data: { role: "ADMIN" } });

  return NextResponse.json({
    success: true,
    message: `${email} is now an ADMIN. This endpoint is now permanently disabled.`,
  });
}
