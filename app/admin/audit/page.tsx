"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { LoadingSkeleton } from "@/components/modals/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import { Pagination } from "@/components/ui/Pagination";
import type { AuditLogEntry } from "@/types/inventory";

const PAGE_SIZE = 25;

const TABLE_LABELS: Record<string, string> = {
  inventory_master: "Inventory",
  daily_logs: "Daily Log",
  transfers: "Transfer",
};

const OP_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  INSERT: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  UPDATE: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  DELETE: { bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
};

function formatData(data: Record<string, unknown> | null): string {
  if (!data) return "—";
  const entries = Object.entries(data).filter(
    ([k]) => !["created_at", "audit_id", "activity_id"].includes(k)
  );
  return entries
    .map(([k, v]) => {
      const label = k.replace(/_/g, " ");
      if (v === null || v === undefined) return null;
      if (typeof v === "object") return `${label}: ${JSON.stringify(v)}`;
      return `${label}: ${v}`;
    })
    .filter(Boolean)
    .join(", ");
}

export default function AuditPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const offset = (page - 1) * PAGE_SIZE;
        const res = await fetch(`/api/audit?offset=${offset}&limit=${PAGE_SIZE}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        const json = await res.json();
        setLogs(json.data?.logs || []);
        setTotal(json.data?.total || 0);
      } catch {
        toast("Failed to load audit log", "error");
      }
      setLoading(false);
    }
    fetchLogs();
  }, [toast, page]);

  function timeAgo(timestamp: string): string {
    const seconds = Math.floor((now - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  if (loading) return <LoadingSkeleton rows={8} />;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Audit Log</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track all changes to inventory, logs, and transfers.
          </p>
        </div>
        {!loading && total > 0 && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {total} entries
          </span>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">No audit entries yet</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            They will appear once the SQL triggers are set up.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const config = OP_CONFIG[log.operation] || { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", dot: "bg-gray-500" };

            return (
              <div
                key={log.audit_id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <button
                  onClick={() => setExpandedId(expandedId === log.audit_id ? null : log.audit_id)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
                >
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                    {log.operation}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {TABLE_LABELS[log.table_name] || log.table_name}
                  </span>
                  <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{log.user_email}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(log.timestamp)}</span>
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform dark:text-gray-500 ${expandedId === log.audit_id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {expandedId === log.audit_id && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 pb-4 pt-3 dark:border-gray-800 dark:bg-gray-800/50">
                    <div className="mb-3 text-xs text-gray-400 dark:text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div className="space-y-2">
                      {log.operation !== "INSERT" && log.old_data && (
                        <div className="rounded-md border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-800 dark:bg-rose-900/10">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Before</span>
                          </div>
                          <p className="break-all font-mono text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                            {formatData(log.old_data)}
                          </p>
                        </div>
                      )}
                      {log.operation !== "DELETE" && log.new_data && (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-900/10">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              {log.operation === "INSERT" ? "Created" : "After"}
                            </span>
                          </div>
                          <p className="break-all font-mono text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                            {formatData(log.new_data)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Pagination
            page={page}
            totalPages={Math.ceil(total / PAGE_SIZE)}
            onPageChange={(p) => {
              setPage(p);
              setExpandedId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
