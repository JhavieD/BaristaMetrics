import { getSupabase } from "@/lib/supabase/client";

type ActivityType = "login" | "logout" | "export" | "ai_audit" | "item_create" | "item_update" | "item_delete" | "transfer" | "log_submit";

export async function logActivity(activityType: ActivityType, details?: Record<string, unknown>) {
  try {
    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session) return;

    await getSupabase().from("user_activity").insert({
      user_email: session.user.email,
      activity_type: activityType,
      details: details || null,
    });
  } catch {
    // Silent fail - activity logging should never break the app
  }
}
