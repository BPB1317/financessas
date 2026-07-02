"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";
import { applyDueDcaEvents } from "@/lib/dca";
import type { ActionState } from "@/components/admin/FormDialog";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createDcaRule(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const memberId = String(formData.get("member_id") ?? "");
  const amount = Number(formData.get("amount") ?? NaN);
  const dayOfMonth = Number(formData.get("day_of_month") ?? NaN);
  const startDate = String(formData.get("start_date") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (
    !memberId ||
    !startDate ||
    Number.isNaN(amount) ||
    amount <= 0 ||
    Number.isNaN(dayOfMonth) ||
    dayOfMonth < 1 ||
    dayOfMonth > 28
  ) {
    return {
      error:
        "Membre, montant (> 0), jour du mois (1 à 28) et date de départ sont obligatoires.",
    };
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("dca_rules").insert({
    member_id: memberId,
    amount,
    day_of_month: dayOfMonth,
    start_date: startDate,
    note,
  });

  if (error) return { error: error.message };

  await applyDueDcaEvents();
  revalidateAll();
  return { success: true };
}

export async function toggleDcaRuleActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";

  const supabase = supabaseServer();
  await supabase.from("dca_rules").update({ active }).eq("id", id);

  if (active) await applyDueDcaEvents();
  revalidateAll();
}

export async function deleteDcaRule(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const supabase = supabaseServer();
  await supabase.from("dca_rules").delete().eq("id", id);

  revalidateAll();
}

export async function applyDcaRulesNow(): Promise<void> {
  await requireAdmin();
  await applyDueDcaEvents();
  revalidateAll();
}
