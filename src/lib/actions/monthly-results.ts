"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";
import { recomputeReinvestments } from "@/lib/recompute";
import type { ActionState } from "@/components/admin/FormDialog";

function revalidateAll() {
  revalidatePath("/", "layout");
}

async function uploadPdf(supabase: ReturnType<typeof supabaseServer>, id: string, file: File) {
  const path = `${id}.pdf`;
  const { error } = await supabase.storage
    .from("bilans")
    .upload(path, file, { upsert: true, contentType: "application/pdf" });
  if (error) throw error;
  return path;
}

export async function createMonthlyResult(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const date = String(formData.get("date") ?? "");
  const totalBenefice = Number(formData.get("total_benefice") ?? NaN);
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const pdf = formData.get("pdf");

  if (!date || Number.isNaN(totalBenefice)) {
    return { error: "Le mois et le bénéfice total sont obligatoires." };
  }

  const supabase = supabaseServer();
  const { data: result, error } = await supabase
    .from("monthly_results")
    .insert({ date, total_benefice: totalBenefice, summary })
    .select("id")
    .single();

  if (error) {
    return {
      error: error.code === "23505" ? "Un bilan existe déjà pour ce mois." : error.message,
    };
  }

  if (pdf instanceof File && pdf.size > 0) {
    const path = await uploadPdf(supabase, result.id, pdf);
    await supabase.from("monthly_results").update({ pdf_path: path }).eq("id", result.id);
  }

  await recomputeReinvestments();
  revalidateAll();
  return { success: true };
}

export async function updateMonthlyResult(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const totalBenefice = Number(formData.get("total_benefice") ?? NaN);
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const pdf = formData.get("pdf");

  if (!id || !date || Number.isNaN(totalBenefice)) {
    return { error: "Le mois et le bénéfice total sont obligatoires." };
  }

  const supabase = supabaseServer();
  const update: Record<string, unknown> = { date, total_benefice: totalBenefice, summary };

  if (pdf instanceof File && pdf.size > 0) {
    update.pdf_path = await uploadPdf(supabase, id, pdf);
  }

  const { error } = await supabase.from("monthly_results").update(update).eq("id", id);
  if (error) {
    return {
      error: error.code === "23505" ? "Un bilan existe déjà pour ce mois." : error.message,
    };
  }

  await recomputeReinvestments();
  revalidateAll();
  return { success: true };
}

export async function deleteMonthlyResult(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const supabase = supabaseServer();
  await supabase.storage.from("bilans").remove([`${id}.pdf`]);
  await supabase.from("monthly_results").delete().eq("id", id);

  await recomputeReinvestments();
  revalidateAll();
}
