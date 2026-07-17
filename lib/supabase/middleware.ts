import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { AppError } from "@/lib/utils/errors";
import { ADMIN_EMAIL } from "@/lib/utils/constants";

export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", "Missing or invalid authorization header", 401);
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new AppError("UNAUTHORIZED", "Invalid or expired token", 401);
  }

  return user;
}

export function isAdmin(userEmail: string): boolean {
  return userEmail === ADMIN_EMAIL;
}

export async function requireAdmin(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!isAdmin(user.email || "")) {
    throw new AppError("FORBIDDEN", "Admin access required", 403);
  }
  return user;
}
