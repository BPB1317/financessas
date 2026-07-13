"use server";

import { requireAdmin } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";
import { recomputeReinvestments } from "@/lib/recompute";
import { invalidateFundData as revalidateAll } from "@/lib/data";
import type { ActionState } from "@/components/admin/FormDialog";

export async function createInvestmentEvent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const memberId = String(formData.get("member_id") ?? "");
  const date = String(formData.get("date") ?? "");
  const amount = Number(formData.get("amount") ?? NaN);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!memberId || !date || Number.isNaN(amount) || amount === 0) {
    return { error: "Membre, date et montant (différent de zéro) sont obligatoires." };
  }

  const supabase = supabaseServer();
  const { error } = await supabase.from("investment_events").insert({
    member_id: memberId,
    date,
    amount,
    source: "manual",
    note,
  });

  if (error) return { error: error.message };

  await recomputeReinvestments();
  revalidateAll();
  return { success: true };
}

export async function updateInvestmentEvent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const amount = Number(formData.get("amount") ?? NaN);
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!id || !date || Number.isNaN(amount) || amount === 0) {
    return { error: "Date et montant (différent de zéro) sont obligatoires." };
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("investment_events")
    .update({ date, amount, note })
    .eq("id", id)
    .eq("source", "manual");

  if (error) return { error: error.message };

  await recomputeReinvestments();
  revalidateAll();
  return { success: true };
}

export async function deleteInvestmentEvent(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const supabase = supabaseServer();
  await supabase.from("investment_events").delete().eq("id", id).eq("source", "manual");

  await recomputeReinvestments();
  revalidateAll();
}

// Masque/démasque un mouvement dans l'historique visible par les membres.
// Ne change rien aux calculs (investissement, dividendes) : le mouvement
// continue de compter normalement, seule sa ligne disparaît de la vue publique.
export async function toggleInvestmentEventHidden(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const hidden = formData.get("hidden") === "true";

  const supabase = supabaseServer();
  await supabase.from("investment_events").update({ hidden }).eq("id", id);

  revalidateAll();
}
