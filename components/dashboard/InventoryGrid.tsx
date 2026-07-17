"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { LoadingSkeleton } from "@/components/modals/LoadingSkeleton";
import { formatQuantity, calculateVariance, formatPercent } from "@/lib/utils/helpers";
import type { InventoryStatus, BranchId } from "@/types/inventory";

export function InventoryGrid() {
  const [branch, setBranch] = useState<BranchId>("jaen");
  const [items, setItems] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      const { data } = await supabase
        .from("current_inventory_status")
        .select("*")
        .eq("branch_id", branch)
        .order("item_name");
      setItems(data || []);
      setLoading(false);
    }
    fetchInventory();
  }, [branch]);

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Inventory Status</h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(["jaen", "ktown"] as BranchId[]).map((b) => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                branch === b
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {b.charAt(0).toUpperCase() + b.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No inventory items for this branch.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-2 pr-4 font-medium">Item</th>
                <th className="pb-2 pr-4 font-medium">Unit</th>
                <th className="pb-2 pr-4 font-medium text-right">Starting</th>
                <th className="pb-2 pr-4 font-medium text-right">Added</th>
                <th className="pb-2 pr-4 font-medium text-right">Deducted</th>
                <th className="pb-2 pr-4 font-medium text-right">Expected</th>
                <th className="pb-2 font-medium text-right">Physical</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const variance =
                  item.actual_physical_count !== null
                    ? calculateVariance(
                        item.expected_remaining_stock,
                        item.actual_physical_count
                      )
                    : null;
                return (
                  <tr key={item.item_id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {item.item_name}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{item.unit}</td>
                    <td className="py-3 pr-4 text-right font-mono text-gray-700">
                      {formatQuantity(item.starting_stock, item.unit)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-green-600">
                      +{formatQuantity(item.total_added, item.unit)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-red-600">
                      -{formatQuantity(item.total_deducted, item.unit)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-semibold text-gray-900">
                      {formatQuantity(item.expected_remaining_stock, item.unit)}
                    </td>
                    <td className="py-3 text-right">
                      {item.actual_physical_count !== null ? (
                        <span
                          className={
                            variance !== null && variance < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {formatQuantity(item.actual_physical_count, item.unit)}{" "}
                          {variance !== null && (
                            <span className="text-xs">
                              ({formatPercent(variance)})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
