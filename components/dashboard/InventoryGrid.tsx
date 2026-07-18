"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRealtime } from "@/hooks/useRealtime";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton } from "@/components/modals/LoadingSkeleton";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { logActivity } from "@/lib/utils/activity";
import { calculateVariance, formatPercent } from "@/lib/utils/helpers";
import { ALLOWED_BRANCHES, CATEGORIES } from "@/lib/utils/constants";
import type { InventoryStatus, BranchId, ItemCategory } from "@/types/inventory";

type SortField = "item_name" | "starting_stock" | "total_added" | "total_deducted" | "expected_remaining_stock" | "actual_physical_count";
type SortDir = "asc" | "desc";

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

const CATEGORY_ICONS: Record<ItemCategory, React.ReactNode> = {
  powder: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  liquid: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  addon: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
};

function SortHeader({ label, field, sortField, sortDir, onSort, align = "left" }: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  align?: "left" | "right";
}) {
  const active = sortField === field;
  return (
    <th
      className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
        align === "right" ? "text-right" : "text-left"
      } ${active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="inline-flex flex-col leading-none">
          <svg className={`h-2.5 w-2.5 ${active && sortDir === "asc" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"}`} viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 2L8 6H2L5 2Z" />
          </svg>
          <svg className={`h-2.5 w-2.5 -mt-0.5 ${active && sortDir === "desc" ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"}`} viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 8L2 4H8L5 8Z" />
          </svg>
        </span>
      </span>
    </th>
  );
}

function StockBadge({ value, expected }: { value: number; expected: boolean }) {
  if (expected && value < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-500/30">
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        {value.toFixed(0)}
      </span>
    );
  }

  return (
    <span className="font-mono text-sm tabular-nums text-gray-900 dark:text-gray-100">
      {value.toFixed(0)}
    </span>
  );
}

export function InventoryGrid() {
  const { toast } = useToast();
  const [branch, setBranch] = useState<BranchId>("jaen");
  const [items, setItems] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [physicalCount, setPhysicalCount] = useState("");
  const [saving, setSaving] = useState(false);

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>("powder");
  const [newItemStock, setNewItemStock] = useState("0");
  const [addingItem, setAddingItem] = useState(false);

  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<ItemCategory>("powder");
  const [editStock, setEditStock] = useState("");
  const [updatingItem, setUpdatingItem] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<InventoryStatus | null>(null);
  const [deleteLogCount, setDeleteLogCount] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [sortField, setSortField] = useState<SortField>("item_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">("all");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "item_name" ? "asc" : "desc");
    }
  }

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("current_inventory_status")
      .select("*")
      .eq("branch_id", branch)
      .order("item_name");
    setItems(data || []);
    setLoading(false);
  }, [branch]);

  useRealtime({
    table: "daily_logs",
    event: "*",
    filter: `branch_id=eq.${branch}`,
    onChanges: refresh,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("current_inventory_status")
        .select("*")
        .eq("branch_id", branch)
        .order("item_name");
      if (!cancelled) {
        setItems(data || []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [branch]);

  async function addItem() {
    if (!newItemName.trim()) return;
    setAddingItem(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          branch_id: branch,
          item_name: newItemName.trim(),
          category: newItemCategory,
          unit: "packs",
          starting_stock: parseFloat(newItemStock) || 0,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to add item");
      toast("Item added", "success");
      logActivity("item_create", { item_name: newItemName.trim(), branch_id: branch });
      setNewItemName("");
      setNewItemCategory("powder");
      setNewItemStock("0");
      setShowAddItem(false);
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add item", "error");
    }
    setAddingItem(false);
  }

  async function savePhysicalCount(itemId: number) {
    setSaving(true);
    try {
      const count = physicalCount === "" ? null : parseFloat(physicalCount);
      const { error } = await supabase
        .from("inventory_master")
        .update({ actual_physical_count: count })
        .eq("item_id", itemId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) =>
          item.item_id === itemId
            ? { ...item, actual_physical_count: count }
            : item
        )
      );
      setEditingId(null);
      setPhysicalCount("");
      toast("Physical count saved", "success");
    } catch {
      toast("Failed to save count", "error");
    }
    setSaving(false);
  }

  function startEditItem(item: InventoryStatus) {
    setEditingItem(item.item_id);
    setEditName(item.item_name);
    setEditCategory((item.category as ItemCategory) || "powder");
    setEditStock(item.starting_stock.toString());
  }

  async function saveEditItem(itemId: number) {
    if (!editName.trim()) return;
    setUpdatingItem(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          item_name: editName.trim(),
          category: editCategory,
          starting_stock: parseFloat(editStock) || 0,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to update");
      toast("Item updated", "success");
      logActivity("item_update", { item_id: itemId });
      setEditingItem(null);
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    }
    setUpdatingItem(false);
  }

  async function fetchDeleteLogCount(item: InventoryStatus) {
    const { count } = await supabase
      .from("daily_logs")
      .select("log_id", { count: "exact", head: true })
      .eq("item_id", item.item_id)
      .eq("branch_id", item.branch_id);
    setDeleteLogCount(count ?? 0);
    setDeleteTarget(item);
  }

  async function deleteItem(itemId: number) {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Failed to delete");
      toast("Item deleted", "success");
      logActivity("item_delete", { item_id: itemId, item_name: deleteTarget?.item_name });
      setDeleteTarget(null);
      setDeleteLogCount(null);
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
    setDeleting(false);
  }

  const filteredItems = items
    .filter((i) => filterCategory === "all" || (i.category || "powder") === filterCategory)
    .sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {ALLOWED_BRANCHES.map((b) => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              className={`relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                branch === b
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700"
                  : "text-gray-500 hover:bg-white/60 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-gray-200"
              }`}
            >
              <svg className={`h-4 w-4 ${branch === b ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {BRANCH_LABELS[b]}
            </button>
          ))}
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ItemCategory | "all")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-indigo-400"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        </div>
        <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
        <Button size="sm" onClick={() => setShowAddItem(!showAddItem)}>
          {showAddItem ? (
            "Cancel"
          ) : (
            <>
              <svg className="-ml-0.5 mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Add Item
            </>
          )}
        </Button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddItem && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-800 dark:bg-indigo-900/10">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
            New Ingredient
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Matcha Powder"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  Starting Stock
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Category
              </label>
              <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewItemCategory(cat)}
                    className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                      newItemCategory === cat
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    {CATEGORY_ICONS[cat]}
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Button size="sm" onClick={addItem} disabled={addingItem || !newItemName.trim()}>
                {addingItem ? "Adding..." : "Add Item"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">No inventory items</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your first ingredient to start tracking inventory.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <SortHeader label="Ingredient" field="item_name" sortField={sortField} sortDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Starting" field="starting_stock" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
                  <SortHeader label="Added" field="total_added" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
                  <SortHeader label="Deducted" field="total_deducted" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
                  <SortHeader label="Expected" field="expected_remaining_stock" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
                  <SortHeader label="Physical Count" field="actual_physical_count" sortField={sortField} sortDir={sortDir} onSort={toggleSort} align="right" />
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.map((item) => {
                  const variance =
                    item.actual_physical_count !== null
                      ? calculateVariance(
                          item.expected_remaining_stock,
                          item.actual_physical_count
                        )
                      : null;

                  return (
                    <tr
                      key={item.item_id}
                      className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                    >
                      {/* Ingredient Name */}
                      <td className="px-4 py-3">
                        {editingItem === item.item_id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="block w-full rounded-md border border-indigo-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-indigo-600 dark:bg-gray-800 dark:text-gray-100"
                              autoFocus
                            />
                            <div className="flex gap-1.5">
                              {CATEGORIES.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setEditCategory(c)}
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all ${
                                    editCategory === c
                                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                                  }`}
                                >
                                  {CATEGORY_LABELS[c]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {item.item_name}
                          </span>
                        )}
                      </td>

                      {/* Starting */}
                      <td className="px-4 py-3 text-right">
                        {editingItem === item.item_id ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="block w-24 rounded-md border border-gray-300 px-2 py-1 text-right font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                          />
                        ) : (
                          <span className="font-mono text-sm tabular-nums text-gray-600 dark:text-gray-400">
                            {item.starting_stock.toFixed(0)}
                          </span>
                        )}
                      </td>

                      {/* Added */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                          {item.total_added > 0 ? `+${item.total_added.toFixed(0)}` : "\u2014"}
                        </span>
                      </td>

                      {/* Deducted */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm tabular-nums text-rose-600 dark:text-rose-400">
                          {item.total_deducted > 0 ? `-${item.total_deducted.toFixed(0)}` : "\u2014"}
                        </span>
                      </td>

                      {/* Expected */}
                      <td className="px-4 py-3 text-right">
                        <StockBadge
                          value={item.expected_remaining_stock}
                          expected={true}
                        />
                      </td>

                      {/* Physical Count */}
                      <td className="px-4 py-3 text-right">
                        {editingId === item.item_id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              step="0.01"
                              value={physicalCount}
                              onChange={(e) => setPhysicalCount(e.target.value)}
                              placeholder="0.00"
                              className="block w-24 rounded-md border border-gray-300 px-2 py-1 text-right font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                              autoFocus
                            />
                            <button
                              onClick={() => savePhysicalCount(item.item_id)}
                              disabled={saving}
                              className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                            >
                              {saving ? "..." : "Save"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setPhysicalCount("");
                              }}
                              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(item.item_id);
                              setPhysicalCount(
                                item.actual_physical_count?.toString() || ""
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-1.5 text-sm font-mono text-gray-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                          >
                            {item.actual_physical_count !== null ? (
                              <>
                                <span className="tabular-nums">
                                  {item.actual_physical_count.toFixed(0)}
                                </span>
                                {variance !== null && (
                                  <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                      variance < 0
                                        ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                                    }`}
                                  >
                                    {formatPercent(variance)}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                                Enter count
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        {editingItem === item.item_id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => saveEditItem(item.item_id)}
                              disabled={updatingItem || !editName.trim()}
                              className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                            >
                              {updatingItem ? "..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => startEditItem(item)}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                              title="Edit item"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => fetchDeleteLogCount(item)}
                              className="rounded-md p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                              title="Delete item"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Item"
          message={
            deleteLogCount !== null && deleteLogCount > 0
              ? `Are you sure you want to delete "${deleteTarget.item_name}"? This will also remove ${deleteLogCount} log ${deleteLogCount === 1 ? "entry" : "entries"} for this item. This cannot be undone.`
              : `Are you sure you want to delete "${deleteTarget.item_name}"? This cannot be undone.`
          }
          confirmLabel="Delete"
          onConfirm={() => deleteItem(deleteTarget.item_id)}
          onCancel={() => { setDeleteTarget(null); setDeleteLogCount(null); }}
          loading={deleting}
          danger
        />
      )}
    </div>
  );
}
