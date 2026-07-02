import "server-only";
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

export async function getFundData(): Promise<FundData> {
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
      supabase.from("settings").select("fund_name, manager_share_pct").single(),
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
    settings: (settingsRow ?? { fund_name: "SAS Betting", manager_share_pct: 75 }) as Settings,
    overrides,
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
