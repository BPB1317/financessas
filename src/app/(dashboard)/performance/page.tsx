import {
  cumulativeDividendSeries,
  investmentAsOf,
  totalDividendsReceived,
} from "@/lib/calculations";
import { getFundData, todayIso } from "@/lib/data";
import { getSession } from "@/lib/session";
import { formatEurPrecise, formatMonthYear } from "@/lib/format";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { DividendsChart } from "@/components/charts/DividendsChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PerformancePage({
  searchParams,
}: {
  searchParams: Promise<{ since?: string }>;
}) {
  const { since: sinceParam } = await searchParams;
  const session = await getSession();
  const { members, events, results, settings, overrides } = await getFundData();

  const member = members.find((m) => m.id === session?.memberId);

  if (!member) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun profil membre associé à votre session.
      </p>
    );
  }

  const since = sinceParam || member.joined_date;
  const today = todayIso();

  const resultsSince = results.filter((r) => r.date >= since).sort((a, b) => a.date.localeCompare(b.date));

  const dividendsSince = totalDividendsReceived(
    member.id,
    resultsSince,
    members,
    events,
    settings,
    overrides
  );
  const dividendsAllTime = totalDividendsReceived(
    member.id,
    results,
    members,
    events,
    settings,
    overrides
  );
  const currentInvestment = investmentAsOf(member.id, today, events);

  const chartData = cumulativeDividendSeries(
    [member],
    resultsSince,
    events,
    settings,
    overrides
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ma performance</h1>
        <p className="text-sm text-muted-foreground">
          Vos dividendes personnels, {member.name}, depuis une date de votre choix.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="since">Depuis le</Label>
          <Input id="since" name="since" type="date" defaultValue={since} max={today} />
        </div>
        <Button type="submit">Appliquer</Button>
      </form>

      <StatsCards
        stats={[
          {
            label: `Dividendes perçus depuis le ${new Date(since).toLocaleDateString("fr-FR")}`,
            value: formatEurPrecise(dividendsSince),
          },
          { label: "Investissement actuel", value: formatEurPrecise(currentInvestment) },
          { label: "Total perçu depuis le début", value: formatEurPrecise(dividendsAllTime) },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Cumul de mes dividendes</CardTitle>
          <CardDescription>
            Depuis le {new Date(since).toLocaleDateString("fr-FR")}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DividendsChart data={chartData} members={[{ id: member.id, name: member.name }]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détail mensuel</CardTitle>
          <CardDescription>Vos dividendes mois par mois sur la période.</CardDescription>
        </CardHeader>
        <CardContent>
          {resultsSince.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun bilan enregistré depuis cette date.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mois</TableHead>
                  <TableHead className="text-right">Mon dividende</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...resultsSince]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((result) => {
                    const dividend = totalDividendsReceived(
                      member.id,
                      [result],
                      members,
                      events,
                      settings,
                      overrides
                    );
                    return (
                      <TableRow key={result.id}>
                        <TableCell className="capitalize">
                          {formatMonthYear(result.date)}
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums ${dividend < 0 ? "text-destructive" : ""}`}
                        >
                          {formatEurPrecise(dividend)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
