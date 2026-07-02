import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEurPrecise, formatMonthYear } from "@/lib/format";

export type MonthlyRow = {
  date: string;
  totalBenefice: number;
  dividends: Record<string, number>;
};

export function MonthlyTable({
  members,
  rows,
}: {
  members: { id: string; name: string }[];
  rows: MonthlyRow[];
}) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        Aucun bilan enregistré pour cette année.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mois</TableHead>
          <TableHead className="text-right">Bénéfices</TableHead>
          {members.map((member) => (
            <TableHead key={member.id} className="text-right">
              {member.name}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.date}>
            <TableCell className="capitalize">{formatMonthYear(row.date)}</TableCell>
            <TableCell
              className={`text-right font-mono tabular-nums ${row.totalBenefice < 0 ? "text-destructive" : ""}`}
            >
              {formatEurPrecise(row.totalBenefice)}
            </TableCell>
            {members.map((member) => {
              const value = row.dividends[member.id];
              return (
                <TableCell
                  key={member.id}
                  className={`text-right font-mono tabular-nums ${value < 0 ? "text-destructive" : ""}`}
                >
                  {value ? formatEurPrecise(value) : "–"}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
