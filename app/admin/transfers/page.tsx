"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { ALLOWED_BRANCHES } from "@/lib/utils/constants";
import { logActivity } from "@/lib/utils/activity";
import { transferSchema } from "@/lib/validations/inventory";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LoadingSkeleton } from "@/components/modals/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import type { BranchId, InventoryStatus, Transfer } from "@/types/inventory";

const BRANCH_LABELS: Record<BranchId, string> = {
  jaen: "Jaen",
  mallorca: "Mallorca",
  "san-antonio": "San Antonio",
};

export default function TransfersPage() {
  const { toast } = useToast();
  const [sourceBranch, setSourceBranch] = useState<BranchId>("jaen");
  const [destBranch, setDestBranch] = useState<BranchId>("mallorca");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState<InventoryStatus[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchItems() {
      const { data } = await getSupabase()
        .from("current_inventory_status")
        .select("*")
        .eq("branch_id", sourceBranch)
        .order("item_name");
      setItems(data || []);
      setItemId("");
    }
    fetchItems();
  }, [sourceBranch]);

  useEffect(() => {
    async function fetchTransfers() {
      const { data } = await getSupabase()
        .from("transfers")
        .select("*, inventory_master(item_name, unit)")
        .order("created_at", { ascending: false })
        .limit(20);
      setTransfers(data || []);
      setHistoryLoading(false);
    }
    fetchTransfers();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const parsed = transferSchema.parse({
        source_branch: sourceBranch,
        destination_branch: destBranch,
        item_id: parseInt(itemId),
        quantity: parseFloat(quantity),
      });

      const { data: { session } } = await getSupabase().auth.getSession();

      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(parsed),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Transfer failed");

      toast("Transfer completed", "success");
      logActivity("transfer", { source: sourceBranch, destination: destBranch, item: parseInt(itemId), quantity: parseFloat(quantity) });
      setQuantity("");
      setItemId("");
      const { data } = await getSupabase()
        .from("transfers")
        .select("*, inventory_master(item_name, unit)")
        .order("created_at", { ascending: false })
        .limit(20);
      setTransfers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      toast(err instanceof Error ? err.message : "Transfer failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Stock Transfers
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Move stock between branches. The source branch will be deducted and the destination branch will be credited.
        </p>
      </div>

      {/* Transfer Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-900/30">
            <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">New Transfer</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              id="source"
              label="From Branch"
              value={sourceBranch}
              onChange={(e) => setSourceBranch(e.target.value as BranchId)}
              options={ALLOWED_BRANCHES.map((b) => ({
                value: b,
                label: BRANCH_LABELS[b],
              }))}
            />
            <Select
              id="dest"
              label="To Branch"
              value={destBranch}
              onChange={(e) => setDestBranch(e.target.value as BranchId)}
              options={ALLOWED_BRANCHES.filter((b) => b !== sourceBranch).map((b) => ({
                value: b,
                label: BRANCH_LABELS[b],
              }))}
            />
          </div>

          <Select
            id="item"
            label="Item"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            options={[
              { value: "", label: "Select item..." },
              ...items.map((item) => ({
                value: String(item.item_id),
                label: `${item.item_name} (${item.expected_remaining_stock.toFixed(2)} available)`,
              })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>

          <Button type="submit" disabled={loading || !itemId || !quantity} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Transferring...
              </span>
            ) : (
              "Transfer Stock"
            )}
          </Button>
        </form>
      </div>

      {/* Transfer History */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Transfers</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {transfers.length} total
            </span>
          </div>
        </div>

        {historyLoading ? (
          <LoadingSkeleton rows={3} />
        ) : transfers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No transfers yet</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Transfer history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Item
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    From
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    To
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {transfers.map((t) => (
                  <tr key={t.transfer_id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="whitespace-nowrap px-6 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {(t as unknown as { inventory_master?: { item_name: string } }).inventory_master?.item_name || "-"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {BRANCH_LABELS[t.source_branch]}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        {BRANCH_LABELS[t.destination_branch]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3 text-right font-mono text-sm tabular-nums text-gray-900 dark:text-gray-100">
                      {t.quantity.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
