import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/middleware";
import { transferSchema } from "@/lib/validations/inventory";
import { successResponse, errorResponse } from "@/lib/middleware/error-handler";
import { withApi } from "@/lib/middleware/api-wrapper";

export const POST = withApi(async (request: NextRequest) => {
  try {
    const user = await requireAdmin(request);
    const body = await request.json();
    const parsed = transferSchema.parse(body);

    if (parsed.source_branch === parsed.destination_branch) {
      return errorResponse(new Error("Source and destination must be different"));
    }

    const { data: sourceItem, error: sourceError } = await getSupabaseAdmin()
      .from("current_inventory_status")
      .select("expected_remaining_stock")
      .eq("item_id", parsed.item_id)
      .eq("branch_id", parsed.source_branch)
      .single();

    if (sourceError) throw sourceError;
    if (!sourceItem || sourceItem.expected_remaining_stock < parsed.quantity) {
      return errorResponse(new Error("Insufficient stock at source branch"));
    }

    const { data: sourceMaster } = await getSupabaseAdmin()
      .from("inventory_master")
      .select("item_name, unit")
      .eq("item_id", parsed.item_id)
      .single();

    const { data: destItem } = await getSupabaseAdmin()
      .from("inventory_master")
      .select("item_id")
      .eq("branch_id", parsed.destination_branch)
      .eq("item_name", sourceMaster!.item_name)
      .maybeSingle();

    if (!destItem) {
      await getSupabaseAdmin().from("inventory_master").insert({
        branch_id: parsed.destination_branch,
        item_name: sourceMaster!.item_name,
        unit: sourceMaster!.unit,
        starting_stock: 0,
      });
    }

    const { data: destMaster } = await getSupabaseAdmin()
      .from("inventory_master")
      .select("item_id")
      .eq("branch_id", parsed.destination_branch)
      .eq("item_name", sourceMaster!.item_name)
      .single();

    const { data: transfer, error: transferError } = await getSupabaseAdmin()
      .from("transfers")
      .insert({
        source_branch: parsed.source_branch,
        destination_branch: parsed.destination_branch,
        item_id: parsed.item_id,
        quantity: parsed.quantity,
        initiated_by: user.email!,
      })
      .select()
      .single();

    if (transferError) throw transferError;

    await getSupabaseAdmin().from("daily_logs").insert([
      {
        branch_id: parsed.source_branch,
        item_id: parsed.item_id,
        log_type: "deduction",
        quantity_opened: parsed.quantity,
        logged_by: user.email!,
      },
      {
        branch_id: parsed.destination_branch,
        item_id: destMaster!.item_id,
        log_type: "delivery",
        quantity_opened: parsed.quantity,
        logged_by: user.email!,
      },
    ]);

    return successResponse(transfer);
  } catch (error) {
    return errorResponse(error);
  }
}, { rateLimit: 10 });
