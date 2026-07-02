-- Archive des dividendes historiques (import de l'ancien suivi Excel).
-- Ces montants sont des faits figés, saisis tels quels, et prennent le pas
-- sur le calcul automatique pour le mois concerné (voir lib/dividends.ts).
-- Le moteur de réinvestissement automatique ignore les mois archivés : ils ne
-- font pas grossir l'investissement d'un membre (voir lib/recompute.ts).
create table monthly_dividend_overrides (
  id uuid primary key default gen_random_uuid(),
  monthly_result_id uuid not null references monthly_results(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  amount numeric(12, 2) not null,
  unique (monthly_result_id, member_id)
);

alter table monthly_dividend_overrides enable row level security;
