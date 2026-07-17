import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branch = searchParams.get("branch");

    let query = supabaseAdmin
      .from("transfers")
      .select("*, inventory_master(item_name, unit)")
      .order("created_at", { ascending: false });

    if (branch) {
      query = query.or(`source_branch.eq.${branch},destination_branch.eq.${branch}`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
