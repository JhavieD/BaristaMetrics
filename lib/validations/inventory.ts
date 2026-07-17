import { z } from "zod";
import { ALLOWED_BRANCHES, LOG_TYPES, VALID_UNITS } from "@/lib/utils/constants";

export const logSubmissionSchema = z.object({
  branch_id: z.enum(ALLOWED_BRANCHES),
  item_id: z.number().int().positive(),
  log_type: z.enum(LOG_TYPES),
  quantity_opened: z.number().positive(),
  unit: z.enum(VALID_UNITS),
});

export const inventoryItemSchema = z.object({
  branch_id: z.enum(ALLOWED_BRANCHES),
  item_name: z.string().min(1).max(100),
  unit: z.enum(VALID_UNITS),
  starting_stock: z.number().min(0),
});

export const inventoryUpdateSchema = z.object({
  item_name: z.string().min(1).max(100).optional(),
  unit: z.enum(VALID_UNITS).optional(),
  starting_stock: z.number().min(0).optional(),
  actual_physical_count: z.number().min(0).nullable().optional(),
});

export const transferSchema = z.object({
  source_branch: z.enum(ALLOWED_BRANCHES),
  destination_branch: z.enum(ALLOWED_BRANCHES),
  item_id: z.number().int().positive(),
  quantity: z.number().positive(),
});

export const staffInviteSchema = z.object({
  email: z.string().email(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
