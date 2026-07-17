import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");
    const item_id = searchParams.get("item_id");
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("daily_logs")
      .select("*, inventory_master(item_name, unit)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (branch) query = query.eq("branch_id", branch);
    if (item_id) query = query.eq("item_id", parseInt(item_id));

    const { data, error, count } = await query;

    if (error) throw error;
    return successResponse({ logs: data, total: count });
  } catch (error) {
    return errorResponse(error);
  }
}
