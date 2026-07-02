import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import type { InvestmentEvent, Member, MonthlyResult, Settings } from "@/lib/types";

export type FundData = {
  members: Member[];
  events: InvestmentEvent[];
  results: MonthlyResult[];
  settings: Settings;
};

export async function getFundData(): Promise<FundData> {
  const supabase = supabaseServer();

  const [{ data: members }, { data: events }, { data: results }, { data: settingsRow }] =
    await Promise.all([
      supabase.from("members").select("*").order("joined_date", { ascending: true }),
      supabase.from("investment_events").select("*").order("date", { ascending: true }),
      supabase.from("monthly_results").select("*").order("date", { ascending: true }),
      supabase.from("settings").select("fund_name, manager_share_pct").single(),
    ]);

  return {
    members: (members ?? []) as Member[],
    events: (events ?? []) as InvestmentEvent[],
    results: (results ?? []) as MonthlyResult[],
    settings: (settingsRow ?? { fund_name: "Notre fonds", manager_share_pct: 75 }) as Settings,
  };
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
