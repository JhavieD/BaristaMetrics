"use client";

import { StaffLogForm } from "@/components/forms/StaffLogForm";

export default function StaffPage() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Log Inventory
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Record ingredient usage or new deliveries for your branch.
        </p>
      </div>
      <StaffLogForm />
    </div>
  );
}
