import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/middleware";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { withApi } from "@/lib/middleware/api-wrapper";

export const PUT = withApi(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    await requireAdmin(request);
    const { userId } = await context!.params;
    const body = await request.json();

    if (!body.branch_id) {
      return errorResponse(new Error("branch_id is required"));
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          branch_id: body.branch_id,
        },
      }
    );

    if (error) throw error;
    return successResponse({ user: data.user });
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });

export const DELETE = withApi(async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => {
  try {
    await requireAdmin(request);
    const { userId } = await context!.params;

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return successResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });
