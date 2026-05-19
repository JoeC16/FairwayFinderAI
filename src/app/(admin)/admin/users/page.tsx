import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { fittingSessions: true } },
      subscription: { select: { plan: true, status: true } },
    },
    take: 100,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="px-5 py-3 font-medium text-gray-500">User</th>
              <th className="px-5 py-3 font-medium text-gray-500">Role</th>
              <th className="px-5 py-3 font-medium text-gray-500">Fittings</th>
              <th className="px-5 py-3 font-medium text-gray-500">Plan</th>
              <th className="px-5 py-3 font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{user.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge
                    variant={user.role === "ADMIN" ? "destructive" : user.role === "RETAILER" ? "brand" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {user.role.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-gray-600">{user._count.fittingSessions}</td>
                <td className="px-5 py-3">
                  <span className="text-xs text-gray-500 capitalize">{user.subscription?.plan ?? "—"}</span>
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

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
