import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatEurPrecise, formatPercent } from "@/lib/format";

export type MemberRow = {
  id: string;
  name: string;
  isManager: boolean;
  investment: number;
  partsPct: number;
  dividendPct: number;
  totalDividends: number;
};

export function MembersTable({ rows }: { rows: MemberRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Membre</TableHead>
          <TableHead className="text-right">Investissement</TableHead>
          <TableHead className="text-right">Parts</TableHead>
          <TableHead className="text-right">Dividende</TableHead>
          <TableHead className="text-right">Total perçu</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">
              <span className="flex items-center gap-2">
                {row.name}
                {row.isManager && (
                  <Badge variant="secondary" className="font-normal">
                    Gérant
                  </Badge>
                )}
              </span>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatEurPrecise(row.investment)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatPercent(row.partsPct)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {formatPercent(row.dividendPct)}
            </TableCell>
            <TableCell className="text-right font-mono font-medium tabular-nums">
              {formatEurPrecise(row.totalDividends)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
