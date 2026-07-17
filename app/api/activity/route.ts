import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_activity")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
