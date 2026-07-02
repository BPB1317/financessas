import {
  cumulativeDividendSeries,
  dividendPct,
  investmentAsOf,
  monthlyBreakdown,
  partsPct,
  round2,
  totalDividendsReceived,
  totalInvestmentAsOf,
} from "@/lib/calculations";
import { getFundData, todayIso } from "@/lib/data";
import { formatEur } from "@/lib/format";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { MembersTable, type MemberRow } from "@/components/dashboard/MembersTable";
import { MonthlyTable, type MonthlyRow } from "@/components/dashboard/MonthlyTable";
import { DividendsChart } from "@/components/charts/DividendsChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  const { members, events, results, settings } = await getFundData();
  const today = todayIso();

  const totalInvestment = totalInvestmentAsOf(today, members, events);
  const totalDividendsAllTime = round2(
    members.reduce(
      (sum, m) => sum + totalDividendsReceived(m.id, results, members, events, settings),
      0
    )
  );

  const memberRows: MemberRow[] = members
    .map((m) => ({
      id: m.id,
      name: m.name,
      isManager: m.is_manager,
      investment: investmentAsOf(m.id, today, events),
      partsPct: partsPct(m.id, today, members, events),
      dividendPct: dividendPct(m.id, today, members, events, settings),
      totalDividends: totalDividendsReceived(m.id, results, members, events, settings),
    }))
    .sort((a, b) => (b.isManager ? 1 : 0) - (a.isManager ? 1 : 0) || b.investment - a.investment);

  const chartData = cumulativeDividendSeries(members, results, events, settings);

  const years = Array.from(new Set(results.map((r) => r.date.slice(0, 4)))).sort(
    (a, b) => Number(b) - Number(a)
  );
  const currentYear = today.slice(0, 4);
  const defaultYear = years.includes(currentYear) ? currentYear : years[0];

  const rowsByYear: Record<string, MonthlyRow[]> = {};
  for (const year of years) {
    rowsByYear[year] = results
      .filter((r) => r.date.startsWith(year))
      .map((r) => {
        const breakdown = monthlyBreakdown(r, members, events, settings);
        return {
          date: r.date,
          totalBenefice: r.total_benefice,
          dividends: Object.fromEntries(breakdown.map((b) => [b.memberId, b.dividend])),
        };
      });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-sm text-muted-foreground">
          Situation du fonds au {new Date(today).toLocaleDateString("fr-FR")}.
        </p>
      </div>

      <StatsCards
        stats={[
          { label: "Investissement total du fonds", value: formatEur(totalInvestment) },
          { label: "Membres", value: String(members.filter((m) => m.active).length) },
          { label: "Dividendes versés au total", value: formatEur(totalDividendsAllTime) },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Dividendes versés</CardTitle>
          <CardDescription>Cumul des dividendes perçus par chaque membre dans le temps.</CardDescription>
        </CardHeader>
        <CardContent>
          <DividendsChart
            data={chartData}
            members={members.map((m) => ({ id: m.id, name: m.name }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membres</CardTitle>
          <CardDescription>Investissement, parts et dividendes à date.</CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable rows={memberRows} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bénéfices &amp; dividendes mensuels</CardTitle>
          <CardDescription>Détail mois par mois, par année.</CardDescription>
        </CardHeader>
        <CardContent>
          {years.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun bilan mensuel enregistré pour le moment.
            </p>
          ) : (
            <Tabs defaultValue={defaultYear}>
              <TabsList>
                {years.map((year) => (
                  <TabsTrigger key={year} value={year}>
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
              {years.map((year) => (
                <TabsContent key={year} value={year}>
                  <MonthlyTable
                    members={members.map((m) => ({ id: m.id, name: m.name }))}
                    rows={rowsByYear[year]}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
