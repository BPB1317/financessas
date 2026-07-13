import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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

  const totalBenefice = rows.reduce((sum, row) => sum + row.totalBenefice, 0);
  const totalByMember = Object.fromEntries(
    members.map((member) => [
      member.id,
      rows.reduce((sum, row) => sum + (row.dividends[member.id] ?? 0), 0),
    ])
  );

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
              className={`text-right tabular-nums ${row.totalBenefice < 0 ? "text-destructive" : ""}`}
            >
              {formatEurPrecise(row.totalBenefice)}
            </TableCell>
            {members.map((member) => {
              const value = row.dividends[member.id];
              return (
                <TableCell
                  key={member.id}
                  className={`text-right tabular-nums ${value < 0 ? "text-destructive" : ""}`}
                >
                  {value ? formatEurPrecise(value) : "–"}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total annuel</TableCell>
          <TableCell
            className={`text-right tabular-nums ${totalBenefice < 0 ? "text-destructive" : ""}`}
          >
            {formatEurPrecise(totalBenefice)}
          </TableCell>
          {members.map((member) => (
            <TableCell
              key={member.id}
              className={`text-right tabular-nums ${totalByMember[member.id] < 0 ? "text-destructive" : ""}`}
            >
              {formatEurPrecise(totalByMember[member.id])}
            </TableCell>
          ))}
        </TableRow>
      </TableFooter>
    </Table>
  );
}
