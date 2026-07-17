import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/middleware";
import { inventoryItemSchema } from "@/lib/validations/inventory";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = inventoryItemSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("inventory_master")
      .insert(parsed)
      .select()
      .single();

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
