"use client";

import { useState } from "react";
import { formatEurPrecise } from "@/lib/format";

type PerformanceRingProps = {
  pct: number;
  startDateLabel: string;
  startCapital: number;
  currentCapital: number;
  netProfit: number;
};

// Anneau de progression circulaire (SVG pur) : le pourcentage au centre, le
// détail chiffré au survol (desktop) ou au clic (mobile).
export function PerformanceRing({
  pct,
  startDateLabel,
  startCapital,
  currentCapital,
  netProfit,
}: PerformanceRingProps) {
  const [open, setOpen] = useState(false);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.abs(pct), 1);
  const isPositive = pct >= 0;
  const color = isPositive ? "var(--good)" : "var(--destructive)";

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex size-32 shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Détail de la performance nette"
        aria-expanded={open}
      >
        <svg viewBox="0 0 120 120" className="size-32 -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference * progress} ${circumference}`}
            className="transition-[stroke-dasharray] duration-500 ease-out"
          />
        </svg>
        <span className="absolute flex flex-col items-center">
          <span
            className="text-2xl font-semibold tabular-nums"
            style={{ color }}
          >
            {isPositive ? "+" : ""}
            {(pct * 100).toFixed(1)} %
          </span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">net</span>
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 z-10 mt-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-card p-3 text-sm shadow-md">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Depuis le {startDateLabel}
          </p>
          <dl className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Capital de départ</dt>
              <dd className="tabular-nums">{formatEurPrecise(startCapital)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Capital actuel</dt>
              <dd className="tabular-nums">{formatEurPrecise(currentCapital)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Bénéfice net</dt>
              <dd
                className="tabular-nums"
                style={{ color: netProfit >= 0 ? "var(--good)" : "var(--destructive)" }}
              >
                {netProfit >= 0 ? "+" : ""}
                {formatEurPrecise(netProfit)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
