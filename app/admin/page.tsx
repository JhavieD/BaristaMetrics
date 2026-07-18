"use client";

import { InventoryGrid } from "@/components/dashboard/InventoryGrid";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Inventory Status
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track stock levels, record physical counts, and manage ingredients across branches.
        </p>
      </div>
      <InventoryGrid />
    </div>
  );
}
