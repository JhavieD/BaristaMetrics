import { supabaseAdmin } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function GET() {
  try {
    const { error: invError } = await supabaseAdmin
      .from("inventory_master")
      .select("item_id")
      .limit(1);

    const dbStatus = !invError;

    return successResponse({
      status: "ok",
      database: dbStatus ? "connected" : "disconnected",
      version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      uptime: process.uptime(),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
