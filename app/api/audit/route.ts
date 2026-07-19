import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { withApi } from "@/lib/middleware/api-wrapper";

export const GET = withApi(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data, error, count } = await getSupabaseAdmin()
      .from("audit_log")
      .select("*", { count: "exact" })
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return successResponse({ logs: data, total: count });
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });
