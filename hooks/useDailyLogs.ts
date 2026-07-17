"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { DailyLog, BranchId } from "@/types/inventory";

export function useDailyLogs(branch?: BranchId) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      setLoading(true);
      let query = supabase
        .from("daily_logs")
        .select("*, inventory_master(item_name, unit)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (branch) query = query.eq("branch_id", branch);

      const { data } = await query;
      if (!cancelled) {
        setLogs(data || []);
        setLoading(false);
      }
    }

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [branch]);

  return { logs, loading };
}
