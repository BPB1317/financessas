const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eurPrecise = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactEur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const monthYear = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric",
});

const dateShort = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatEur(value: number): string {
  return eur.format(value);
}

export function formatEurPrecise(value: number): string {
  return eurPrecise.format(value);
}

export function formatEurCompact(value: number): string {
  return compactEur.format(value);
}

export function formatPercent(value: number): string {
  return percent.format(value);
}

export function formatMonthYear(isoDate: string): string {
  return capitalize(monthYear.format(new Date(isoDate)));
}

export function formatDateShort(isoDate: string): string {
  return dateShort.format(new Date(isoDate));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
