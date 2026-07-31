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

const monthYearShort = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "2-digit",
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

// Un bilan mensuel (monthly_results.date) est daté du 1er du mois qui SUIT
// la période qu'il rapporte (le bilan de juillet est enregistré au 1er
// août, pour que les calculs — investissement de départ, réinvestissement —
// se basent sur le mois clos). On retranche donc un mois avant de formater,
// pour que le nom affiché désigne le mois réellement rapporté et non sa
// date d'enregistrement. N'utiliser ces deux fonctions que pour des dates
// de bilan — pas pour une date "brute" quelconque.
// "YYYY-MM-01" du mois réellement rapporté par un bilan. À utiliser pour
// grouper/trier des bilans par année ou par mois affiché (ex: les onglets
// par année du dashboard), pas seulement pour l'affichage textuel.
export function reportingPeriodIso(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  const reportingMonth = month === 1 ? 12 : month - 1;
  const reportingYear = month === 1 ? year - 1 : year;
  return `${reportingYear}-${String(reportingMonth).padStart(2, "0")}-01`;
}

function reportingPeriod(isoDate: string): Date {
  const [year, month] = reportingPeriodIso(isoDate).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

export function formatMonthYear(isoDate: string): string {
  return capitalize(monthYear.format(reportingPeriod(isoDate)));
}

export function formatMonthYearShort(isoDate: string): string {
  return monthYearShort.format(reportingPeriod(isoDate));
}

export function formatDateShort(isoDate: string): string {
  return dateShort.format(new Date(isoDate));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
