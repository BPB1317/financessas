import "server-only";
import { revalidatePath, unstable_cache, updateTag } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import type { DividendOverrides } from "@/lib/calculations";
import type { InvestmentEvent, Member, MonthlyResult, Settings } from "@/lib/types";

export type FundData = {
  members: Member[];
  events: InvestmentEvent[];
  results: MonthlyResult[];
  settings: Settings;
  overrides: DividendOverrides;
};

// Ces tables ne changent que via l'admin, qui invalide ce tag après chaque
// mutation (voir lib/actions/*.ts) — on peut donc mettre en cache le
// résultat entre deux navigations sans risquer d'afficher des données
// périmées, et éviter de refaire 5 requêtes Supabase à chaque clic.
export const FUND_DATA_TAG = "fund-data";

export const getFundData = unstable_cache(
  async (): Promise<FundData> => fetchFundData(),
  ["fund-data"],
  { tags: [FUND_DATA_TAG], revalidate: 300 }
);

async function fetchFundData(): Promise<FundData> {
  const supabase = supabaseServer();

  const [{ data: members }, { data: events }, { data: results }, { data: settingsRow }, { data: overrideRows }] =
    await Promise.all([
      supabase
        .from("members")
        .select("*")
        .order("joined_date", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("investment_events").select("*").order("date", { ascending: true }),
      supabase.from("monthly_results").select("*").order("date", { ascending: true }),
      supabase
        .from("settings")
        .select("fund_name, manager_share_pct, performance_start_date")
        .single(),
      supabase.from("monthly_dividend_overrides").select("monthly_result_id, member_id, amount"),
    ]);

  const overrides: DividendOverrides = {};
  for (const row of overrideRows ?? []) {
    overrides[row.monthly_result_id] ??= {};
    overrides[row.monthly_result_id][row.member_id] = row.amount;
  }

  return {
    members: (members ?? []) as Member[],
    events: (events ?? []) as InvestmentEvent[],
    results: (results ?? []) as MonthlyResult[],
    settings: (settingsRow ?? {
      fund_name: "SAS Betting",
      manager_share_pct: 75,
      performance_start_date: "2026-07-01",
    }) as Settings,
    overrides,
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// À appeler après toute mutation admin (membres, investissements, bilans,
// DCA, paramètres) — uniquement depuis un Server Action. updateTag garantit
// que la requête suivante voit la donnée fraîche (pas de stale-while-
// revalidate), contrairement à revalidateTag.
export function invalidateFundData(): void {
  updateTag(FUND_DATA_TAG);
  revalidatePath("/", "layout");
}
