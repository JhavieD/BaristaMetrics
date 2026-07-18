"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Application Error</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {error.message || "Something went wrong. Please try again."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-gray-400 dark:text-gray-500">Error ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
