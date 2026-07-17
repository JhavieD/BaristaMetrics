import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/supabase/middleware";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    return successResponse({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}
