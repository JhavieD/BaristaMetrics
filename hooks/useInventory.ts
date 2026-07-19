"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { InventoryStatus, BranchId } from "@/types/inventory";

export function useInventory(branch: BranchId) {
  const [items, setItems] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchInventory() {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getSupabase()
        .from("current_inventory_status")
        .select("*")
        .eq("branch_id", branch)
        .order("item_name");

      if (!cancelled) {
        if (fetchError) setError(fetchError.message);
        setItems(data || []);
        setLoading(false);
      }
    }

    fetchInventory();
    return () => {
      cancelled = true;
    };
  }, [branch]);

  return { items, loading, error };
}
