import { supabaseAdmin } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("audit_log")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
