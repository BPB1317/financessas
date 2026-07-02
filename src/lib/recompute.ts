import "server-only";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { supabaseServer } from "@/lib/supabase/server";
import { dividendPct, endOfMonthIso, round2 } from "@/lib/calculations";
import type { InvestmentEvent, Member, MonthlyResult, Settings } from "@/lib/types";

// Régénère tous les mouvements "reinvestment" à partir des mouvements
// manuels et des résultats mensuels. Rejoué en entier (pas de patch
// incrémental) à chaque mutation pertinente depuis l'admin : voir le plan
// pour le raisonnement (effet composé mois après mois).
export async function recomputeReinvestments(): Promise<void> {
  const supabase = supabaseServer();

  const [{ data: members }, { data: manualEvents }, { data: monthlyResults }, { data: settingsRow }] =
    await Promise.all([
      supabase.from("members").select("id, is_manager"),
      supabase.from("investment_events").select("member_id, date, amount").eq("source", "manual"),
      supabase.from("monthly_results").select("id, date, total_benefice").order("date", { ascending: true }),
      supabase.from("settings").select("manager_share_pct").single(),
    ]);

  const membersList = (members ?? []) as Pick<Member, "id" | "is_manager">[];
  const settings = (settingsRow ?? { manager_share_pct: 75 }) as Pick<Settings, "manager_share_pct">;
  const results = (monthlyResults ?? []) as Pick<MonthlyResult, "id" | "date" | "total_benefice">[];

  // Liste d'événements qu'on enrichit au fur et à mesure de la boucle, pour
  // que le mois M+1 voie bien les réinvestissements générés pour le mois M.
  const events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[] = [
    ...((manualEvents ?? []) as Pick<InvestmentEvent, "member_id" | "date" | "amount">[]),
  ];

  const newRows: Array<{
    member_id: string;
    date: string;
    amount: number;
    source: "reinvestment";
    monthly_result_id: string;
    note: string;
  }> = [];

  for (const result of results) {
    const monthLabel = format(parseISO(result.date), "MMMM yyyy", { locale: fr });
    for (const member of membersList) {
      const pct = dividendPct(member.id, endOfMonthIso(result.date), membersList, events, settings);
      const amount = round2(result.total_benefice * pct);
      if (amount === 0) continue;

      const row = {
        member_id: member.id,
        date: result.date,
        amount,
        source: "reinvestment" as const,
        monthly_result_id: result.id,
        note: `Dividende réinvesti - ${monthLabel}`,
      };
      newRows.push(row);
      events.push(row);
    }
  }

  const { error: deleteError } = await supabase
    .from("investment_events")
    .delete()
    .eq("source", "reinvestment");
  if (deleteError) throw deleteError;

  if (newRows.length > 0) {
    const { error: insertError } = await supabase.from("investment_events").insert(newRows);
    if (insertError) throw insertError;
  }
}
