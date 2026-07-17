import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");

    let query = supabaseAdmin
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
}
