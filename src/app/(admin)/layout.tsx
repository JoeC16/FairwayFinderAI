import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/sign-in");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role={session.user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNav user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
