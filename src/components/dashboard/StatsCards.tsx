import { Card, CardContent } from "@/components/ui/card";

type Stat = {
  label: string;
  value: string;
};

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-none border-0">
          <CardContent className="border-l-2 border-l-primary py-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
