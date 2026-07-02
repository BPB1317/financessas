"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatEurCompact, formatEurPrecise, formatMonthYear } from "@/lib/format";

// Une entrée de --chart-1 à --chart-8 (voir globals.css) par slot, dans un
// ordre fixe : chaque membre garde toujours la même couleur, quel que soit
// l'ordre d'affichage ou l'ajout/retrait d'autres membres.
const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export type DividendSeriesPoint = { date: string } & Record<string, number | string>;

type DividendsChartProps = {
  data: DividendSeriesPoint[];
  members: { id: string; name: string }[];
};

export function DividendsChart({ data, members }: DividendsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        Aucun bilan mensuel enregistré pour le moment.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="0"
          stroke="var(--border)"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontFamily: "var(--font-mono)" }}
          tickFormatter={(value: string) =>
            new Date(value).toLocaleDateString("fr-FR", {
              month: "short",
              year: "2-digit",
            })
          }
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontFamily: "var(--font-mono)" }}
          tickFormatter={(value: number) => formatEurCompact(value)}
          width={64}
        />
        <Tooltip
          cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
          content={<DividendsTooltip members={members} />}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="line"
          iconSize={16}
          formatter={(value: string) => (
            <span className="text-foreground">{value}</span>
          )}
        />
        {members.map((member, index) => (
          <Line
            key={member.id}
            type="monotone"
            dataKey={member.id}
            name={member.name}
            stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function DividendsTooltip({
  active,
  payload,
  label,
  members,
}: {
  active?: boolean;
  payload?: { dataKey?: string | number; value?: number | string }[];
  label?: string;
  members: { id: string; name: string }[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const rows = payload
    .map((entry) => {
      const member = members.find((m) => m.id === entry.dataKey);
      return member
        ? { name: member.name, value: Number(entry.value ?? 0) }
        : null;
    })
    .filter((row): row is { name: string; value: number } => row !== null)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="border border-border bg-card p-3 shadow-md">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label ? formatMonthYear(label) : ""}
      </p>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-3 text-sm">
            <span className="font-mono font-medium tabular-nums text-foreground">
              {formatEurPrecise(row.value)}
            </span>
            <span className="text-muted-foreground">{row.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
