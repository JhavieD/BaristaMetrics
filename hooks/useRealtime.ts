"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions {
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  onChanges?: () => void;
  enabled?: boolean;
}

export function useRealtime({ table, event = "*", filter, onChanges, enabled = true }: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;
  const [connected, setConnected] = useState(false);
  const subscribeRef = useRef<(() => void) | null>(null);

  const subscribe = useCallback(() => {
    if (!enabled || !onChanges) return;

    const channel = getSupabase()
      .channel(`realtime:${table}`)
      .on(
        "postgres_changes",
        { event, schema: "public", table, ...(filter ? { filter } : {}) },
        () => {
          retriesRef.current = 0;
          onChanges();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          retriesRef.current = 0;
          setConnected(true);
        }
        if (status === "CHANNEL_ERROR" && retriesRef.current < maxRetries) {
          retriesRef.current++;
          setConnected(false);
          setTimeout(() => {
            channel.unsubscribe();
            subscribeRef.current?.();
          }, Math.min(1000 * Math.pow(2, retriesRef.current), 30000));
        }
      });

    channelRef.current = channel;
  }, [table, event, filter, onChanges, enabled]);

  useEffect(() => {
    subscribeRef.current = subscribe;
    subscribe();
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
        setConnected(false);
      }
    };
  }, [subscribe]);

  return { connected };
}
