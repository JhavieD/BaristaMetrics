"use client";

import { useState, useEffect, useCallback } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== "undefined") {
      return !navigator.onLine;
    }
    return false;
  });

  const handleOnline = useCallback(() => setIsOffline(false), []);
  const handleOffline = useCallback(() => setIsOffline(true), []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white dark:bg-amber-600">
      You&apos;re offline. Logs will be submitted when connection is restored.
    </div>
  );
}
