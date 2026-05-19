import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    include: { subscription: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details.</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-1">Email</p>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Member since</p>
            <p className="text-gray-900">{format(new Date(user.createdAt), "MMMM yyyy")}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Plan</p>
            <Badge variant="brand" className="capitalize text-xs">
              {user.subscription?.plan ?? "free"}
            </Badge>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-1">Role</p>
            <Badge variant="secondary" className="capitalize text-xs">
              {user.role.toLowerCase()}
            </Badge>
          </div>
        </div>
      </div>

      <ProfileForm user={{ id: user.id, name: user.name, image: user.image }} />
    </div>
  );
}
