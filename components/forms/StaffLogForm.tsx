"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { logSubmissionSchema } from "@/lib/validations/inventory";
import { ALLOWED_BRANCHES, LOG_TYPES, VALID_UNITS } from "@/lib/utils/constants";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import type { InventoryStatus, BranchId, LogType, Unit } from "@/types/inventory";

export function StaffLogForm() {
  const [branch, setBranch] = useState<BranchId>("jaen");
  const [logType, setLogType] = useState<LogType>("deduction");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>("packs");
  const [items, setItems] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
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
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const parsed = logSubmissionSchema.parse({
        branch_id: branch,
        item_id: parseInt(itemId),
        log_type: logType,
        quantity_opened: parseFloat(quantity),
        unit,
      });

      const { error: insertError } = await supabase.from("daily_logs").insert({
        branch_id: parsed.branch_id,
        item_id: parsed.item_id,
        log_type: parsed.log_type,
        quantity_opened: parsed.quantity_opened,
        logged_by: session.user.email,
      });

      if (insertError) throw insertError;
      setSuccess(true);
      setQuantity("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit log");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            Log submitted successfully!
          </div>
        )}

        <Select
          id="branch"
          label="Location"
          value={branch}
          onChange={(e) => setBranch(e.target.value as BranchId)}
          options={ALLOWED_BRANCHES.map((b) => ({
            value: b,
            label: `Big Brew - ${b.charAt(0).toUpperCase() + b.slice(1)}`,
          }))}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Action Type
          </label>
          <div className="mt-1 grid grid-cols-2 gap-3">
            {LOG_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLogType(type as LogType)}
                className={`rounded-md border-2 p-4 text-center text-sm font-medium transition-colors ${
                  logType === type
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {type === "deduction" ? "📋 Used / Refill" : "📦 New Delivery"}
              </button>
            ))}
          </div>
        </div>

        <Select
          id="item"
          label="Ingredients - Particulars"
          value={itemId}
          onChange={(e) => {
            setItemId(e.target.value);
            const item = items.find((i) => i.item_id === parseInt(e.target.value));
            if (item) setUnit(item.unit as Unit);
          }}
          options={[
            { value: "", label: "Select ingredient..." },
            ...items.map((item) => ({
              value: String(item.item_id),
              label: item.item_name,
            })),
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity Opened
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.00"
              required
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {VALID_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !itemId || !quantity}
          className="w-full"
        >
          {loading ? "Submitting..." : "SUBMIT LOG TO JANA"}
        </Button>
      </form>
    </Card>
  );
}
