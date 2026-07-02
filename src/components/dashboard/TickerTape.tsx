import { formatDateShort, formatEurPrecise } from "@/lib/format";

export type TickerItem = {
  id: string;
  memberName: string;
  amount: number;
  date: string;
  isReinvestment: boolean;
};

// Bande d'activité récente, discrète et statique (pas d'animation) — un
// simple rappel des derniers mouvements, défilable au doigt/à la molette sur
// petit écran, sans effet gadget.
export function TickerTape({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-4 py-2.5 sm:px-6">
        <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Activité récente
        </span>
        {items.map((item) => (
          <div key={item.id} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
            <span className="text-xs text-muted-foreground">{formatDateShort(item.date)}</span>
            <span className="font-medium">{item.memberName}</span>
            <span
              className={`tabular-nums ${item.amount < 0 ? "text-destructive" : "text-foreground"}`}
            >
              {item.amount >= 0 ? "+" : ""}
              {formatEurPrecise(item.amount)}
            </span>
            {item.isReinvestment && (
              <span className="text-xs text-muted-foreground">(réinvesti)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
