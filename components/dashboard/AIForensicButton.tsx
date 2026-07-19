"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { BranchId } from "@/types/inventory";

interface AuditResult {
  summary: string;
  anomalies: string[];
  projections: string[];
}

export function AIForensicButton({ branch }: { branch: BranchId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");

  async function handleAudit() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ branch }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Audit failed");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleAudit}
        disabled={loading}
        variant="secondary"
      >
        {loading ? "Running AI Audit..." : "Run AI Forensic Audit"}
      </Button>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700">Summary</h4>
            <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
          </div>
          {result.anomalies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700">Anomalies</h4>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                {result.anomalies.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {result.projections.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-700">Projections</h4>
              <ul className="mt-1 list-disc pl-5 text-sm text-gray-600">
                {result.projections.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
