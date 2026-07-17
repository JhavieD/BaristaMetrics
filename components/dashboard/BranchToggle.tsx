"use client";

import { useState } from "react";
import type { BranchId } from "@/types/inventory";

export function BranchToggle({
  onChange,
}: {
  onChange?: (branch: BranchId) => void;
}) {
  const [branch, setBranch] = useState<BranchId>("jaen");

  function handleSwitch(b: BranchId) {
    setBranch(b);
    onChange?.(b);
  }

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {(["jaen", "ktown"] as BranchId[]).map((b) => (
        <button
          key={b}
          onClick={() => handleSwitch(b)}
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
  );
}
