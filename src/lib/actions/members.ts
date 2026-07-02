"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";
import { recomputeReinvestments } from "@/lib/recompute";
import type { ActionState } from "@/components/admin/FormDialog";

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createMember(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const joinedDate = String(formData.get("joined_date") ?? "");
  const isManager = formData.get("is_manager") === "on";
  const initialInvestment = Number(formData.get("initial_investment") ?? 0);

  if (!name || !email || !joinedDate) {
    return { error: "Nom, email et date d'entrée sont obligatoires." };
  }

  const supabase = supabaseServer();
  const { data: member, error } = await supabase
    .from("members")
    .insert({ name, email, joined_date: joinedDate, is_manager: isManager })
    .select("id")
    .single();

  if (error) {
    return {
      error: error.code === "23505" ? "Cet email est déjà utilisé par un autre membre." : error.message,
    };
  }

  if (initialInvestment && initialInvestment !== 0) {
    await supabase.from("investment_events").insert({
      member_id: member.id,
      date: joinedDate,
      amount: initialInvestment,
      source: "manual",
      note: "Investissement initial",
    });
  }

  await recomputeReinvestments();
  revalidateAll();
  return { success: true };
}

export async function updateMember(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const joinedDate = String(formData.get("joined_date") ?? "");
  const isManager = formData.get("is_manager") === "on";

  if (!id || !name || !email || !joinedDate) {
    return { error: "Nom, email et date d'entrée sont obligatoires." };
  }

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("members")
    .update({ name, email, joined_date: joinedDate, is_manager: isManager })
    .eq("id", id);

  if (error) {
    return {
      error: error.code === "23505" ? "Cet email est déjà utilisé par un autre membre." : error.message,
    };
  }

  await recomputeReinvestments();
  revalidateAll();
  return { success: true };
}

export async function toggleMemberActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";

  const supabase = supabaseServer();
  await supabase.from("members").update({ active }).eq("id", id);
  revalidateAll();
}
