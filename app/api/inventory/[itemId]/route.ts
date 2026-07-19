import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/middleware";
import { inventoryUpdateSchema } from "@/lib/validations/inventory";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { withApi } from "@/lib/middleware/api-wrapper";

export const PUT = withApi(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    await requireAdmin(request);
    const { itemId } = await context!.params;
    const id = parseInt(itemId);
    if (isNaN(id)) return errorResponse(new Error("Invalid item ID"));

    const body = await request.json();
    const parsed = inventoryUpdateSchema.parse(body);

    const { data, error } = await getSupabaseAdmin()
      .from("inventory_master")
      .update(parsed)
      .eq("item_id", id)
      .select()
      .single();

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });

export const DELETE = withApi(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    await requireAdmin(request);
    const { itemId } = await context!.params;
    const id = parseInt(itemId);
    if (isNaN(id)) return errorResponse(new Error("Invalid item ID"));

    const { error: logsError } = await getSupabaseAdmin()
      .from("daily_logs")
      .delete()
      .eq("item_id", id);

    if (logsError) throw logsError;

    const { error: transfersError } = await getSupabaseAdmin()
      .from("transfers")
      .delete()
      .eq("item_id", id);

    if (transfersError) throw transfersError;

    const { error } = await getSupabaseAdmin()
      .from("inventory_master")
      .delete()
      .eq("item_id", id);

    if (error) throw error;
    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });
