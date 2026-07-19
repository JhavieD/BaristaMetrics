import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/middleware";
import { inventoryItemSchema } from "@/lib/validations/inventory";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { withApi } from "@/lib/middleware/api-wrapper";

export const GET = withApi(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");

    let query = getSupabaseAdmin()
      .from("current_inventory_status")
      .select("*")
      .order("item_name");

    if (branch) {
      query = query.eq("branch_id", branch);
    }

    const { data, error } = await query;

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withApi(async (request: NextRequest) => {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = inventoryItemSchema.parse(body);

    const { data, error } = await getSupabaseAdmin()
      .from("inventory_master")
      .insert(parsed)
      .select()
      .single();

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });
