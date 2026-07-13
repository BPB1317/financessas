"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";
import { recomputeReinvestments } from "@/lib/recompute";
import type { ActionState } from "@/components/admin/FormDialog";

export async function updateSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const fundName = String(formData.get("fund_name") ?? "").trim();
  const managerSharePct = Number(formData.get("manager_share_pct") ?? NaN);
  const performanceStartDate = String(formData.get("performance_start_date") ?? "");

  if (!fundName) {
    return { error: "Le nom du fonds est obligatoire." };
  }
  if (Number.isNaN(managerSharePct) || managerSharePct < 0 || managerSharePct > 100) {
    return { error: "La part du gérant doit être un nombre entre 0 et 100." };
  }
  if (!performanceStartDate) {
    return { error: "La date de référence pour la performance nette est obligatoire." };
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("settings")
    .update({
      fund_name: fundName,
      manager_share_pct: managerSharePct,
      performance_start_date: performanceStartDate,
    })
    .eq("id", true);

  if (error) return { error: error.message };

  await recomputeReinvestments();
  revalidatePath("/", "layout");
  return { success: true };
}
