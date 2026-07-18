"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { BranchToggle } from "@/components/dashboard/BranchToggle";
import { LoadingSkeleton } from "@/components/modals/LoadingSkeleton";
import type { BranchId, InventoryStatus } from "@/types/inventory";

interface Summary {
  totalItems: number;
  totalDeductions: number;
  totalDeliveries: number;
  lowStockItems: number;
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [branch, setBranch] = useState<BranchId>("jaen");
  const [items, setItems] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({
    totalItems: 0,
    totalDeductions: 0,
    totalDeliveries: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      const { data } = await supabase
        .from("current_inventory_status")
        .select("*")
        .eq("branch_id", branch)
        .order("item_name");

      const items = data || [];
      setItems(items);
      setSummary({
        totalItems: items.length,
        totalDeductions: items.reduce((sum, i) => sum + (i.total_deducted || 0), 0),
        totalDeliveries: items.reduce((sum, i) => sum + (i.total_added || 0), 0),
        lowStockItems: items.filter((i) => i.expected_remaining_stock <= i.starting_stock * 0.2).length,
      });
      setLoading(false);
    }
    fetchAnalytics();
  }, [branch]);

  function exportCSV() {
    const headers = ["Item", "Starting Stock", "Total Added", "Total Deducted", "Expected Remaining", "Physical Count", "Variance"];
    const rows = items.map((item) => {
      const variance = item.actual_physical_count !== null
        ? item.actual_physical_count - item.expected_remaining_stock
        : "";
      return [
        item.item_name,
        item.starting_stock,
        item.total_added,
        item.total_deducted,
        item.expected_remaining_stock,
        item.actual_physical_count ?? "",
        variance,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barista-metrics-${branch}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consumption overview and variance report for the selected branch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BranchToggle onChange={setBranch} />
          <Button variant="secondary" size="sm" onClick={exportCSV} disabled={items.length === 0}>
            <svg className="-ml-0.5 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              label="Total Items"
              value={summary.totalItems}
              color="bg-indigo-50 dark:bg-indigo-900/20"
              icon={
                <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              }
            />
            <SummaryCard
              label="Total Deducted"
              value={summary.totalDeductions.toFixed(1)}
              color="bg-rose-50 dark:bg-rose-900/20"
              icon={
                <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              }
            />
            <SummaryCard
              label="Total Delivered"
              value={summary.totalDeliveries.toFixed(1)}
              color="bg-emerald-50 dark:bg-emerald-900/20"
              icon={
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              }
            />
            <SummaryCard
              label="Low Stock"
              value={summary.lowStockItems}
              color="bg-amber-50 dark:bg-amber-900/20"
              icon={
                <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              }
            />
          </div>

          {/* Consumption */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                  <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Consumption Overview</h2>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No data for this branch.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 p-6 dark:divide-gray-800">
                {items.map((item) => {
                  const consumptionPercent =
                    item.starting_stock > 0
                      ? (item.total_deducted / item.starting_stock) * 100
                      : 0;
                  return (
                    <div key={item.item_id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.item_name}</span>
                        <span className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
                          {item.total_deducted.toFixed(1)} / {item.starting_stock.toFixed(1)} used
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            consumptionPercent > 80
                              ? "bg-rose-500"
                              : consumptionPercent > 50
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(consumptionPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Variance Report */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                  <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Variance Report</h2>
              </div>
            </div>

            {items.filter((i) => i.actual_physical_count !== null).length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No physical count data yet</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter actual counts on the Inventory page to see variance data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-800/50">
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Item
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Expected
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actual
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Variance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {items
                      .filter((i) => i.actual_physical_count !== null)
                      .map((item) => {
                        const variance = item.actual_physical_count! - item.expected_remaining_stock;
                        const variancePercent =
                          item.expected_remaining_stock !== 0
                            ? (variance / item.expected_remaining_stock) * 100
                            : 0;
                        return (
                          <tr key={item.item_id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{item.item_name}</td>
                            <td className="px-6 py-3 text-right font-mono text-sm tabular-nums text-gray-600 dark:text-gray-400">
                              {item.expected_remaining_stock.toFixed(2)}
                            </td>
                            <td className="px-6 py-3 text-right font-mono text-sm tabular-nums text-gray-900 dark:text-gray-100">
                              {item.actual_physical_count!.toFixed(2)}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  variance < 0
                                    ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                                }`}
                              >
                                {variance >= 0 ? "+" : ""}
                                {variance.toFixed(2)}
                                <span className="text-[10px] opacity-75">
                                  ({variancePercent >= 0 ? "+" : ""}
                                  {variancePercent.toFixed(1)}%)
                                </span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
