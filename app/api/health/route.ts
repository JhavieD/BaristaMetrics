import { getSupabaseAdmin } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { withApi } from "@/lib/middleware/api-wrapper";

export const GET = withApi(async () => {
  try {
    const start = Date.now();

    const { error: invError } = await getSupabaseAdmin()
      .from("inventory_master")
      .select("item_id")
      .limit(1);

    const dbLatency = Date.now() - start;
    const dbStatus = !invError;

    const { count: itemCount } = await getSupabaseAdmin()
      .from("inventory_master")
      .select("item_id", { count: "exact", head: true });

    const { count: logCount } = await getSupabaseAdmin()
      .from("daily_logs")
      .select("log_id", { count: "exact", head: true });

    const { count: userCount } = await getSupabaseAdmin()
      .from("user_activity")
      .select("activity_id", { count: "exact", head: true });

    return successResponse({
      status: dbStatus ? "healthy" : "degraded",
      database: {
        status: dbStatus ? "connected" : "disconnected",
        latencyMs: dbLatency,
      },
      stats: {
        inventoryItems: itemCount ?? 0,
        totalLogs: logCount ?? 0,
        activityRecords: userCount ?? 0,
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    return errorResponse(error);
  }
});
