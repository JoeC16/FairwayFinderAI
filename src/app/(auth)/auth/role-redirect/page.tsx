import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RoleRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/sign-in");

  if (session.user.role === "ADMIN") redirect("/admin/dashboard");
  if (session.user.role === "RETAILER") redirect("/retailer/dashboard");
  redirect("/dashboard");
}
