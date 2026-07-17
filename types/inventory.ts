export type LogType = "deduction" | "delivery";

export type BranchId = "jaen" | "ktown";

export type Unit = "kg" | "grams" | "packs";

export interface InventoryItem {
  item_id: number;
  branch_id: BranchId;
  item_name: string;
  unit: Unit;
  starting_stock: number;
  actual_physical_count: number | null;
  created_at: string;
}

export interface InventoryStatus extends InventoryItem {
  total_deducted: number;
  total_added: number;
  expected_remaining_stock: number;
}

export interface DailyLog {
  log_id: number;
  branch_id: BranchId;
  item_id: number;
  log_type: LogType;
  quantity_opened: number;
  logged_by: string;
  created_at: string;
}

export interface AuditLogEntry {
  audit_id: number;
  table_name: string;
  operation: string;
  user_email: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  timestamp: string;
}

export interface UserActivity {
  activity_id: number;
  user_email: string;
  activity_type: string;
  details: Record<string, unknown> | null;
  timestamp: string;
}

export interface Transfer {
  transfer_id: number;
  source_branch: BranchId;
  destination_branch: BranchId;
  item_id: number;
  quantity: number;
  initiated_by: string;
  created_at: string;
}
