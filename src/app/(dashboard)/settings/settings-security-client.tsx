"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Props {
  email: string;
  hasPassword: boolean;
  userId: string;
}

export function SettingsSecurityClient({ email, hasPassword }: Props) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwLoading(true);
    setPwError("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to change password");
      setPwSuccess(true);
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete account");
      await signOut({ callbackUrl: "/" });
    } catch {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
          <Shield className="h-5 w-5 text-brand-700" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Security</h2>
          <p className="text-sm text-gray-400">Password and authentication</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-gray-900">Email</p>
            <p className="text-xs text-gray-400">{email}</p>
          </div>
          <Badge variant="success" className="text-xs">Verified</Badge>
        </div>

        <div className="py-3 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Password</p>
              <p className="text-xs text-gray-400">{hasPassword ? "Set" : "Using social login"}</p>
            </div>
            {hasPassword && (
              <Button size="sm" variant="outline" onClick={() => { setShowPasswordForm(!showPasswordForm); setPwSuccess(false); setPwError(""); }}>
                {showPasswordForm ? "Cancel" : "Change"}
              </Button>
            )}
          </div>

          {pwSuccess && (
            <p className="text-xs text-green-600 mt-2">Password updated successfully.</p>
          )}

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              {pwError && <p className="text-xs text-red-600 bg-red-50 rounded-lg p-2">{pwError}</p>}
              <div className="space-y-1">
                <Label className="text-xs">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className="pr-9"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" size="sm" disabled={pwLoading}>
                {pwLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-2 p-4 bg-red-50 rounded-xl border border-red-100">
        <h3 className="text-sm font-semibold text-red-900 mb-1">Danger Zone</h3>
        <p className="text-xs text-red-700 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>

        {!showDeleteConfirm ? (
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete Account
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-red-700 font-medium">Type <strong>DELETE</strong> to confirm:</p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="h-8 text-sm border-red-200"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm Delete"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
