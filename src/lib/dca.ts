import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { recomputeReinvestments } from "@/lib/recompute";

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

function toIso(year: number, month1to12: number, day: number): string {
  return `${pad(year, 4)}-${pad(month1to12, 2)}-${pad(day, 2)}`;
}

// Toutes les dates "dues" pour une règle DCA entre son démarrage et
// `throughDateIso` inclus : une par mois, au jour `dayOfMonth`. Le jour est
// toujours ≤ 28 (contrainte du schéma), donc valide dans tous les mois.
export function computeDcaDueDates(
  startDateIso: string,
  dayOfMonth: number,
  throughDateIso: string
): string[] {
  const [startY, startM, startD] = startDateIso.split("-").map(Number);

  let year = startY;
  let month = startM; // 1-12
  if (startD > dayOfMonth) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  const dates: string[] = [];
  let candidate = toIso(year, month, dayOfMonth);
  while (candidate <= throughDateIso) {
    dates.push(candidate);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    candidate = toIso(year, month, dayOfMonth);
  }
  return dates;
}

export type DcaRule = {
  id: string;
  member_id: string;
  amount: number;
  day_of_month: number;
  start_date: string;
  active: boolean;
};

// Génère tous les mouvements d'investissement dus pour les règles DCA
// actives, jusqu'à aujourd'hui inclus. Idempotent : ne recrée jamais un
// mouvement déjà existant pour une (règle, date) donnée — sûr à rejouer par
// le cron quotidien ou le bouton "Appliquer maintenant".
export async function applyDueDcaEvents(): Promise<number> {
  const supabase = supabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  const { data: rules } = await supabase
    .from("dca_rules")
    .select("id, member_id, amount, day_of_month, start_date, active")
    .eq("active", true);

  const { data: existing } = await supabase
    .from("investment_events")
    .select("dca_rule_id, date")
    .not("dca_rule_id", "is", null);

  const existingKeys = new Set(
    (existing ?? []).map((e) => `${e.dca_rule_id}:${e.date}`)
  );

  const newRows: Array<{
    member_id: string;
    date: string;
    amount: number;
    source: "manual";
    dca_rule_id: string;
    note: string;
  }> = [];

  for (const rule of (rules ?? []) as DcaRule[]) {
    const dueDates = computeDcaDueDates(rule.start_date, rule.day_of_month, today);
    for (const date of dueDates) {
      if (existingKeys.has(`${rule.id}:${date}`)) continue;
      newRows.push({
        member_id: rule.member_id,
        date,
        amount: rule.amount,
        source: "manual",
        dca_rule_id: rule.id,
        note: `Investissement programmé (DCA) - ${date}`,
      });
    }
  }

  if (newRows.length > 0) {
    const { error } = await supabase.from("investment_events").insert(newRows);
    if (error) throw error;
    await recomputeReinvestments();
  }

  return newRows.length;
}
