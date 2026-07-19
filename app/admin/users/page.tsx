"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { LoadingSkeleton } from "@/components/modals/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import { ALLOWED_BRANCHES } from "@/lib/utils/constants";
import type { BranchId } from "@/types/inventory";

const BRANCH_LABELS: Record<BranchId, string> = {
  jaen: "Jaen",
  mallorca: "Mallorca",
  "san-antonio": "San Antonio",
};

interface StaffUser {
  id: string;
  email: string;
  branch_id: BranchId | null;
  created_at: string;
  last_sign_in_at: string | null;
}

function useStaffUsers() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const json = await res.json();
      setUsers(json.data || []);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  return { users, loading, fetchUsers };
}

export default function UsersPage() {
  const { toast } = useToast();
  const { users, loading, fetchUsers } = useStaffUsers();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBranch, setInviteBranch] = useState<BranchId>("jaen");
  const [inviting, setInviting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [editBranchValue, setEditBranchValue] = useState<BranchId>("jaen");
  const [savingBranch, setSavingBranch] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);

    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email: inviteEmail, branch_id: inviteBranch }),
      });
      const json = await res.json();

      if (json.success) {
        toast(`Invitation sent to ${inviteEmail}`, "success");
        setInviteEmail("");
        fetchUsers();
      } else {
        toast(json.error?.message || "Failed to invite", "error");
      }
    } catch {
      toast("Failed to invite user", "error");
    }
    setInviting(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to remove");
      toast("Staff member removed", "success");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to remove", "error");
    }
    setDeleting(false);
  }

  async function saveBranch(userId: string) {
    setSavingBranch(true);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ branch_id: editBranchValue }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to update");
      toast("Branch updated", "success");
      setEditingBranch(null);
      fetchUsers();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update branch", "error");
    }
    setSavingBranch(false);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Staff Management
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Invite new staff members and manage existing team access.
        </p>
      </div>

      {/* Invite Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30">
            <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Invite Staff</h2>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              id="invite-email"
              type="email"
              placeholder="staff@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              id="invite-branch"
              value={inviteBranch}
              onChange={(e) => setInviteBranch(e.target.value as BranchId)}
              options={ALLOWED_BRANCHES.map((b) => ({
                value: b,
                label: BRANCH_LABELS[b],
              }))}
            />
          </div>
          <Button type="submit" disabled={inviting || !inviteEmail}>
            {inviting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              <>
                <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Invite
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Staff List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Registered Staff</h2>
            </div>
            {!loading && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {users.length} {users.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No staff members</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Invite your first team member to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      {editingBranch === user.id ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={editBranchValue}
                            onChange={(e) => setEditBranchValue(e.target.value as BranchId)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                          >
                            {ALLOWED_BRANCHES.map((b) => (
                              <option key={b} value={b}>{BRANCH_LABELS[b]}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveBranch(user.id)}
                            disabled={savingBranch}
                            className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                          >
                            {savingBranch ? "..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingBranch(null)}
                            className="rounded-md px-1.5 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingBranch(user.id);
                            setEditBranchValue((user.branch_id as BranchId) || "jaen");
                          }}
                          className="group/branch inline-flex items-center gap-1 rounded-md border border-dashed border-gray-200 px-2 py-0.5 text-xs transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20"
                        >
                          {user.branch_id ? (
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                              {BRANCH_LABELS[user.branch_id as BranchId] || user.branch_id}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                              </svg>
                              Assign
                            </span>
                          )}
                          <svg className="h-3 w-3 text-gray-300 opacity-0 transition-opacity group-hover/branch:opacity-100 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-gray-500 dark:text-gray-400">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="rounded-md p-1.5 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:text-gray-500 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                        title="Remove staff member"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Remove Staff Member"
          message={`Are you sure you want to remove ${deleteTarget.email}? This will revoke their access immediately. This action cannot be undone.`}
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
          danger
        />
      )}
    </div>
  );
}
