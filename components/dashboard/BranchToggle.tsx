"use client";

import { useState } from "react";
import { ALLOWED_BRANCHES } from "@/lib/utils/constants";
import type { BranchId } from "@/types/inventory";

const BRANCH_LABELS: Record<BranchId, string> = {
  jaen: "Jaen",
  mallorca: "Mallorca",
  "san-antonio": "San Antonio",
};

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
      {ALLOWED_BRANCHES.map((b) => (
        <button
          key={b}
          onClick={() => handleSwitch(b)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            branch === b
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {BRANCH_LABELS[b]}
        </button>
      ))}
    </div>
  );
}
