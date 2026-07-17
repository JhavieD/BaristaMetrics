import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/supabase/middleware";
import { logSubmissionSchema } from "@/lib/validations/inventory";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const body = await request.json();
    const parsed = logSubmissionSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("daily_logs")
      .insert({
        branch_id: parsed.branch_id,
        item_id: parsed.item_id,
        log_type: parsed.log_type,
        quantity_opened: parsed.quantity_opened,
        logged_by: user.email!,
      })
      .select()
      .single();

    if (error) throw error;
    return successResponse(data);
  } catch (error) {
    return errorResponse(error);
  }
}
