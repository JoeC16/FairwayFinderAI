import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users } from "lucide-react";
import { format } from "date-fns";
import { CreateUserForm, UserActions, RoleBadge } from "./actions";

export default async function AdminUsersPage() {
  const [authSession, users] = await Promise.all([
    getServerSession(authOptions),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { fittingSessions: true } },
        subscription: { select: { plan: true, status: true, fittingCredits: true } },
      },
      take: 200,
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <CreateUserForm />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">User</th>
                <th className="px-5 py-3 font-medium text-gray-500">Role</th>
                <th className="px-5 py-3 font-medium text-gray-500">Fittings</th>
                <th className="px-5 py-3 font-medium text-gray-500">Credits</th>
                <th className="px-5 py-3 font-medium text-gray-500">Joined</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className={user.active ? "hover:bg-gray-50" : "bg-gray-50/60 opacity-60 hover:opacity-80"}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{user.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <RoleBadge role={user.role} active={user.active} />
                  </td>
                  <td className="px-5 py-3 text-gray-600">{user._count.fittingSessions}</td>
                  <td className="px-5 py-3 text-gray-600">{user.subscription?.fittingCredits ?? 0}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <UserActions
                      user={{ id: user.id, name: user.name, email: user.email, role: user.role, active: user.active }}
                      isSelf={user.id === authSession?.user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No users yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
