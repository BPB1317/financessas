import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase/server";

// Protégé indépendamment du proxy (voir lib/session.ts) : sert de passerelle
// vers le bucket Storage privé "bilans" via une URL signée de courte durée,
// jamais d'accès direct au fichier.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireSession();
  const { id } = await params;

  const supabase = supabaseServer();
  const { data: result } = await supabase
    .from("monthly_results")
    .select("pdf_path")
    .eq("id", id)
    .maybeSingle();

  if (!result?.pdf_path) {
    return NextResponse.json({ error: "Bilan introuvable." }, { status: 404 });
  }

  const { data: signed, error } = await supabase.storage
    .from("bilans")
    .createSignedUrl(result.pdf_path, 60);

  if (error || !signed) {
    return NextResponse.json({ error: "Impossible de générer le lien." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
