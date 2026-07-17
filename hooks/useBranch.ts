"use client";

import { useState } from "react";
import type { BranchId } from "@/types/inventory";
import { DEFAULT_BRANCH } from "@/lib/utils/constants";

export function useBranch() {
  const [branch, setBranch] = useState<BranchId>(DEFAULT_BRANCH);
  return { branch, setBranch };
}
