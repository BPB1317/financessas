import { getFundData } from "@/lib/data";
import { formatDateShort, formatEurPrecise } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function InvestissementsPage() {
  const { members, events } = await getFundData();
  const memberById = new Map(members.map((m) => [m.id, m]));

  const rows = [...events].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historique des investissements</h1>
        <p className="text-sm text-muted-foreground">
          Tous les apports, retraits et dividendes réinvestis, du plus récent au plus ancien.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mouvements</CardTitle>
          <CardDescription>{rows.length} mouvement(s) enregistré(s).</CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun mouvement enregistré pour le moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Membre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{formatDateShort(event.date)}</TableCell>
                    <TableCell className="font-medium">
                      {memberById.get(event.member_id)?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      {event.source === "reinvestment" ? (
                        <Badge variant="secondary">Dividende réinvesti</Badge>
                      ) : event.amount >= 0 ? (
                        <Badge variant="outline">Apport</Badge>
                      ) : (
                        <Badge variant="outline">Retrait</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        event.amount < 0 ? "text-destructive" : ""
                      }`}
                    >
                      {formatEurPrecise(event.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.note ?? ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
