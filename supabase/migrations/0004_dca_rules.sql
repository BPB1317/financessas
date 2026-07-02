-- Règles d'investissement programmé (DCA) : "+X € pour ce membre chaque
-- jour Y du mois". Un job (cron Vercel, voir /api/cron/dca) et un bouton
-- "Appliquer maintenant" dans l'admin génèrent les mouvements dus, de façon
-- idempotente (jamais deux mouvements pour la même règle à la même date).
create table dca_rules (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  day_of_month smallint not null check (day_of_month between 1 and 28),
  start_date date not null default current_date,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

alter table dca_rules enable row level security;

alter table investment_events
  add column dca_rule_id uuid references dca_rules(id) on delete set null;

create index investment_events_dca_rule_id_idx on investment_events (dca_rule_id);

-- Empêche deux mouvements générés pour la même règle à la même date, même en
-- cas d'exécution concurrente du cron et du bouton manuel.
create unique index investment_events_dca_unique_idx
  on investment_events (dca_rule_id, date)
  where dca_rule_id is not null;
