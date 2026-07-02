import { Card, CardContent } from "@/components/ui/card";

type Stat = {
  label: string;
  value: string;
};

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60">
          <CardContent className="py-2">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
