"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal, KeyRound, UserX, UserCheck, Trash2,
  Loader2, UserPlus, ChevronDown, X
} from "lucide-react";

type Role = "CONSUMER" | "RETAILER" | "ADMIN";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  active: boolean;
}

// ── Create User Form ──────────────────────────────────────────────────────────

export function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CONSUMER" as Role });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json() as { error?: string };
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed"); return; }
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "CONSUMER" });
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="h-4 w-4" />
        Create User
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Create User</h3>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="cu-name">Full Name</Label>
          <Input id="cu-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="cu-email">Email</Label>
          <Input id="cu-email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="cu-password">Password</Label>
          <Input id="cu-password" type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} placeholder="min. 8 characters" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="cu-role">Role</Label>
          <select
            id="cu-role"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="CONSUMER">Consumer</option>
            <option value="RETAILER">Retailer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={loading} className="flex-1 gap-2">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Create
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

// ── Per-row Actions ───────────────────────────────────────────────────────────

export function UserActions({ user, isSelf }: { user: User; isSelf: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<"role" | "password" | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");

  async function patch(data: Partial<User>) {
    setLoading(JSON.stringify(data));
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(null);
    setOpen(false);
    router.refresh();
  }

  async function handleRoleChange(role: Role) {
    await patch({ role });
    setPanel(null);
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) { setPwError("Min. 8 characters"); return; }
    setLoading("pw");
    setPwError("");
    const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setLoading(null);
    if (!res.ok) { setPwError("Failed — please try again"); return; }
    setNewPassword("");
    setPanel(null);
    setOpen(false);
  }

  async function handleToggleActive() {
    await patch({ active: !user.active });
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return;
    setLoading("delete");
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  const ROLES: Role[] = ["CONSUMER", "RETAILER", "ADMIN"];

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(o => !o); setPanel(null); }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setPanel(null); }} />
          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl border border-gray-200 shadow-xl w-52 overflow-hidden">

            {/* Role change */}
            <button
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setPanel(p => p === "role" ? null : "role")}
            >
              <span>Change Role</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {panel === "role" && (
              <div className="border-t border-gray-50 bg-gray-50 px-4 py-2 space-y-1">
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    disabled={r === user.role || isSelf}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors capitalize"
                  >
                    {loading === JSON.stringify({ role: r }) ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : null}
                    {r.toLowerCase()} {r === user.role ? "✓" : ""}
                  </button>
                ))}
              </div>
            )}

            {/* Reset password */}
            <button
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-50"
              onClick={() => setPanel(p => p === "password" ? null : "password")}
            >
              <span className="flex items-center gap-2"><KeyRound className="h-3.5 w-3.5" /> Reset Password</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
            {panel === "password" && (
              <form onSubmit={handleResetPassword} className="border-t border-gray-50 bg-gray-50 px-4 py-2 space-y-2">
                <Input
                  type="text"
                  placeholder="New password (min. 8)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="h-7 text-xs"
                  minLength={8}
                  required
                />
                {pwError && <p className="text-xs text-red-600">{pwError}</p>}
                <Button type="submit" size="sm" disabled={loading === "pw"} className="w-full h-7 text-xs gap-1">
                  {loading === "pw" && <Loader2 className="h-3 w-3 animate-spin" />}
                  Set Password
                </Button>
              </form>
            )}

            {/* Disable / Enable */}
            <button
              onClick={handleToggleActive}
              disabled={isSelf || loading !== null}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm border-t border-gray-50 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {user.active
                ? <><UserX className="h-3.5 w-3.5 text-amber-500" /><span className="text-amber-700">Disable Account</span></>
                : <><UserCheck className="h-3.5 w-3.5 text-green-500" /><span className="text-green-700">Enable Account</span></>
              }
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={isSelf || loading === "delete"}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading === "delete" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Role Badge ────────────────────────────────────────────────────────────────

export function RoleBadge({ role, active }: { role: Role; active: boolean }) {
  if (!active) return <Badge variant="secondary" className="text-xs opacity-60">disabled</Badge>;
  return (
    <Badge
      variant={role === "ADMIN" ? "destructive" : role === "RETAILER" ? "brand" : "secondary"}
      className="text-xs capitalize"
    >
      {role.toLowerCase()}
    </Badge>
  );
}
