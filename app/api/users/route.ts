import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/middleware";
import { staffInviteSchema } from "@/lib/validations/inventory";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { withApi } from "@/lib/middleware/api-wrapper";
import { ADMIN_EMAIL } from "@/lib/utils/constants";

export const GET = withApi(async (request: NextRequest) => {
  try {
    await requireAdmin(request);

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    const users = data.users
      .filter((u) => u.email !== ADMIN_EMAIL)
      .map((u) => ({
        id: u.id,
        email: u.email,
        branch_id: u.user_metadata?.branch_id || null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));

    return successResponse(users);
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });

export const POST = withApi(async (request: NextRequest) => {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const parsed = staffInviteSchema.parse(body);

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      parsed.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
        data: {
          branch_id: parsed.branch_id,
        },
      }
    );

    if (error) throw error;
    return successResponse({ user: data.user });
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 5 });
