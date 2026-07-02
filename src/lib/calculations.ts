import type { InvestmentEvent, Member, MonthlyResult, Settings } from "@/lib/types";

// Fonctions pures : aucune dépendance à Supabase ou à Next.js, pour rester
// facilement testables et réutilisables entre le dashboard (lecture) et
// l'admin (recalcul, aperçu en direct).

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

// Dernier jour du mois d'une date ISO (YYYY-MM-DD) donnée, en UTC pour éviter
// tout décalage de fuseau horaire. `monthly_results.date` est toujours le 1er
// du mois par convention, mais un mouvement d'investissement manuel peut être
// daté n'importe quel jour de ce même mois et doit quand même compter dans le
// calcul du dividende de ce mois-là (voir "modification en cours de mois").
export function endOfMonthIso(dateIso: string): string {
  const [year, month] = dateIso.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

// Investissement cumulé d'un membre à une date donnée (inclut les apports,
// retraits, et dividendes déjà réinvestis à cette date).
export function investmentAsOf(
  memberId: string,
  date: string,
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[]
): number {
  return round2(
    events
      .filter((e) => e.member_id === memberId && e.date <= date)
      .reduce((sum, e) => sum + e.amount, 0)
  );
}

// Investissement cumulé total (tous membres) à une date donnée.
export function totalInvestmentAsOf(
  date: string,
  members: Pick<Member, "id">[],
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[]
): number {
  return round2(
    members.reduce((sum, m) => sum + investmentAsOf(m.id, date, events), 0)
  );
}

// Part de propriété d'un membre (investissement / investissement total), à
// une date donnée. Sert à l'affichage "Parts" du dashboard, distinct de la
// règle de répartition des dividendes.
export function partsPct(
  memberId: string,
  date: string,
  members: Pick<Member, "id">[],
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[]
): number {
  const total = totalInvestmentAsOf(date, members, events);
  if (total <= 0) return 0;
  return investmentAsOf(memberId, date, events) / total;
}

// % de dividende d'un membre à une date donnée : part fixe et paramétrable
// pour le gérant, solde réparti au prorata de l'investissement des autres
// membres entre eux.
export function dividendPct(
  memberId: string,
  date: string,
  members: Pick<Member, "id" | "is_manager">[],
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[],
  settings: Pick<Settings, "manager_share_pct">
): number {
  const member = members.find((m) => m.id === memberId);
  if (!member) return 0;

  const managerShare = settings.manager_share_pct / 100;

  if (member.is_manager) {
    return managerShare;
  }

  const nonManagers = members.filter((m) => !m.is_manager);
  const nonManagerTotal = round2(
    nonManagers.reduce((sum, m) => sum + investmentAsOf(m.id, date, events), 0)
  );
  if (nonManagerTotal <= 0) return 0;

  const memberInvestment = investmentAsOf(memberId, date, events);
  if (memberInvestment <= 0) return 0;

  return (memberInvestment / nonManagerTotal) * (1 - managerShare);
}

// Dividendes archivés (import de l'ancien suivi Excel) : { [monthly_result_id]: { [member_id]: montant } }.
// Quand une valeur existe ici pour un (mois, membre), elle prime sur le calcul
// automatique — voir supabase/migrations/0002_dividend_overrides.sql.
export type DividendOverrides = Record<string, Record<string, number>>;

// Dividende en euros d'un membre pour un mois donné.
export function memberMonthlyDividend(
  memberId: string,
  result: Pick<MonthlyResult, "id" | "date" | "total_benefice">,
  members: Pick<Member, "id" | "is_manager">[],
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[],
  settings: Pick<Settings, "manager_share_pct">,
  overrides?: DividendOverrides
): number {
  const override = overrides?.[result.id]?.[memberId];
  if (override !== undefined) return override;

  const pct = dividendPct(memberId, endOfMonthIso(result.date), members, events, settings);
  return round2(result.total_benefice * pct);
}

export type MemberMonthlyBreakdown = {
  memberId: string;
  dividend: number;
};

// Répartition d'un mois donné entre tous les membres (utilisé pour générer
// les mouvements de réinvestissement et pour l'affichage du tableau mensuel).
export function monthlyBreakdown(
  result: Pick<MonthlyResult, "id" | "date" | "total_benefice">,
  members: Pick<Member, "id" | "is_manager">[],
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[],
  settings: Pick<Settings, "manager_share_pct">,
  overrides?: DividendOverrides
): MemberMonthlyBreakdown[] {
  return members.map((m) => ({
    memberId: m.id,
    dividend: memberMonthlyDividend(m.id, result, members, events, settings, overrides),
  }));
}

// Série cumulée du dividende de chaque membre dans le temps, pour le
// graphique "Dividendes versés". `results` doit être trié par date croissante.
export function cumulativeDividendSeries(
  members: Pick<Member, "id" | "name" | "is_manager">[],
  results: Pick<MonthlyResult, "id" | "date" | "total_benefice">[],
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[],
  settings: Pick<Settings, "manager_share_pct">,
  overrides?: DividendOverrides
): Array<{ date: string } & Record<string, number | string>> {
  const running: Record<string, number> = Object.fromEntries(
    members.map((m) => [m.id, 0])
  );

  return [...results]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((result) => {
      const row: { date: string } & Record<string, number | string> = {
        date: result.date,
      };
      for (const member of members) {
        const dividend = memberMonthlyDividend(
          member.id,
          result,
          members,
          events,
          settings,
          overrides
        );
        running[member.id] = round2(running[member.id] + dividend);
        row[member.id] = running[member.id];
      }
      return row;
    });
}

// Total des dividendes perçus par un membre depuis le début.
export function totalDividendsReceived(
  memberId: string,
  results: Pick<MonthlyResult, "id" | "date" | "total_benefice">[],
  members: Pick<Member, "id" | "is_manager">[],
  events: Pick<InvestmentEvent, "member_id" | "date" | "amount">[],
  settings: Pick<Settings, "manager_share_pct">,
  overrides?: DividendOverrides
): number {
  return round2(
    results.reduce(
      (sum, r) => sum + memberMonthlyDividend(memberId, r, members, events, settings, overrides),
      0
    )
  );
}
