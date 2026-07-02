import { formatDateShort, formatEurPrecise } from "@/lib/format";

export type TickerItem = {
  id: string;
  memberName: string;
  amount: number;
  date: string;
  isReinvestment: boolean;
};

// Bandeau défilant façon écran de trading, purement CSS (pas de JS) : le
// contenu est dupliqué une fois et translaté de -50%, ce qui boucle sans
// à-coup. En pause au survol pour laisser le temps de lire.
export function TickerTape({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-border bg-card">
      <div className="flex w-max animate-[ticker-scroll_50s_linear_infinite] gap-10 py-2.5 hover:[animation-play-state:paused]">
        {loop.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm"
          >
            <span className="text-xs text-muted-foreground">{formatDateShort(item.date)}</span>
            <span className="font-medium">{item.memberName}</span>
            <span
              className={`font-mono tabular-nums ${
                item.amount < 0 ? "text-destructive" : "text-primary"
              }`}
            >
              {item.amount >= 0 ? "+" : ""}
              {formatEurPrecise(item.amount)}
            </span>
            {item.isReinvestment && (
              <span className="text-xs text-muted-foreground">(réinvesti)</span>
            )}
            <span className="text-border">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
