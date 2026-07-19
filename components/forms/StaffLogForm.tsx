"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { logSubmissionSchema } from "@/lib/validations/inventory";
import { logActivity } from "@/lib/utils/activity";
import { LOG_TYPES, ALLOWED_BRANCHES, CATEGORIES } from "@/lib/utils/constants";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/modals/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import type { InventoryStatus, BranchId, LogType, ItemCategory } from "@/types/inventory";

const BRANCH_LABELS: Record<BranchId, string> = {
  jaen: "Jaen",
  mallorca: "Mallorca",
  "san-antonio": "San Antonio",
};

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  powder: "Powder",
  liquid: "Liquid",
  addon: "Addon",
};

export function StaffLogForm() {
  const { toast } = useToast();
  const [branch, setBranch] = useState<BranchId | null>(null);
  const [logType, setLogType] = useState<LogType>("deduction");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [items, setItems] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [branchLoading, setBranchLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">("all");

  useEffect(() => {
    async function loadBranch() {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session) {
        const userBranch = session.user.user_metadata?.branch_id as BranchId | undefined;
        if (userBranch) {
          setBranch(userBranch);
        } else {
          setIsAdmin(true);
        }
      }
      setBranchLoading(false);
    }
    loadBranch();
  }, []);

  useEffect(() => {
    if (!branch) return;
    async function fetchItems() {
      const { data } = await getSupabase()
        .from("current_inventory_status")
        .select("*")
        .eq("branch_id", branch)
        .order("item_name");
      setItems(data || []);
      setItemId("");
    }
    fetchItems();
  }, [branch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!branch) return;
    setLoading(true);

    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (!session) throw new Error("Not logged in");

      const parsed = logSubmissionSchema.parse({
        branch_id: branch,
        item_id: parseInt(itemId),
        log_type: logType,
        quantity_opened: parseFloat(quantity),
        unit: "packs",
      });

      const { error: insertError } = await getSupabase().from("daily_logs").insert({
        branch_id: parsed.branch_id,
        item_id: parsed.item_id,
        log_type: parsed.log_type,
        quantity_opened: parsed.quantity_opened,
        logged_by: session.user.email,
      });

      if (insertError) throw insertError;
      toast("Log submitted successfully", "success");
      logActivity("log_submit", { item_id: parseInt(itemId), log_type: logType, quantity: parseFloat(quantity) });
      setQuantity("");
      setItemId("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to submit log", "error");
    } finally {
      setLoading(false);
    }
  }

  if (branchLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (!branch) {
    if (isAdmin) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Select a branch to log inventory for:
          </div>
          <div className="flex gap-2">
            {ALLOWED_BRANCHES.map((b) => (
              <button
                key={b}
                onClick={() => setBranch(b)}
                className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
              >
                {BRANCH_LABELS[b]}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-600 dark:bg-gray-800/50">
        <p className="text-sm text-gray-500 dark:text-gray-400">No branch assigned to your account. Contact admin.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30">
            <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">New Log Entry</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {BRANCH_LABELS[branch]}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Action Type
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            {LOG_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLogType(type as LogType)}
                className={`relative rounded-lg border-2 p-4 text-center text-sm font-medium transition-all ${
                  logType === type
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  {type === "deduction" ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  )}
                  {type === "deduction" ? "Used / Refill" : "New Delivery"}
                </div>
                {logType === type && (
                  <div className="absolute -top-px -right-px flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500">
                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ingredient
          </label>
          <div className="mt-1.5">
            {/* Category Tabs */}
            <div className="mb-2 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setFilterCategory("all")}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  filterCategory === "all"
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    filterCategory === cat
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative mb-2">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ingredient..."
                className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>
            {/* Item List */}
            <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
              {items
                .filter((item) => {
                  const matchesCategory = filterCategory === "all" || (item.category || "powder") === filterCategory;
                  const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesCategory && matchesSearch;
                })
                .map((item) => (
                  <button
                    key={item.item_id}
                    type="button"
                    onClick={() => setItemId(String(item.item_id))}
                    className={`flex w-full items-center justify-between border-b border-gray-100 px-3 py-2 text-left text-sm transition-colors last:border-0 dark:border-gray-700 ${
                      itemId === String(item.item_id)
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{item.item_name}</span>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                      {item.expected_remaining_stock.toFixed(0)} left
                    </span>
                  </button>
                ))}
              {items.filter((item) => {
                const matchesCategory = filterCategory === "all" || (item.category || "powder") === filterCategory;
                const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
              }).length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                  No ingredients found
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity
          </label>
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

        <Button
          type="submit"
          disabled={loading || !itemId || !quantity}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Log"
          )}
        </Button>
      </form>
    </div>
  );
}
