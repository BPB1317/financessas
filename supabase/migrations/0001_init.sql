-- Schéma initial du dashboard du fonds.
-- Toute la logique métier (calcul des dividendes, réinvestissement) vit côté
-- application (lib/calculations.ts) : ces tables ne stockent que des faits bruts.

create extension if not exists "pgcrypto";

-- Paramètres du fonds (une seule ligne).
create table settings (
  id boolean primary key default true,
  constraint settings_singleton check (id = true),
  fund_name text not null default 'Notre fonds',
  manager_share_pct numeric(5, 2) not null default 75,
  updated_at timestamptz not null default now()
);

insert into settings (id) values (true);

-- Membres du fonds.
create table members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  is_manager boolean not null default false,
  joined_date date not null default current_date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bilans mensuels : bénéfice total du fonds pour un mois + résumé + PDF optionnel.
create table monthly_results (
  id uuid primary key default gen_random_uuid(),
  date date not null unique, -- toujours le 1er du mois
  total_benefice numeric(12, 2) not null,
  summary text,
  pdf_path text, -- chemin dans le bucket Storage "bilans"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Historique des mouvements d'investissement (apports/retraits manuels et
-- réinvestissements de dividendes générés automatiquement).
create table investment_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  date date not null,
  amount numeric(12, 2) not null, -- positif = apport, négatif = retrait
  source text not null default 'manual' check (source in ('manual', 'reinvestment')),
  monthly_result_id uuid references monthly_results(id) on delete cascade,
  note text,
  created_at timestamptz not null default now()
);

create index investment_events_member_id_idx on investment_events (member_id);
create index investment_events_date_idx on investment_events (date);
create index investment_events_monthly_result_id_idx on investment_events (monthly_result_id);

-- RLS activé partout, aucune policy définie : la clé service_role (utilisée
-- uniquement côté serveur dans lib/supabase/server.ts) bypass RLS, donc ces
-- tables ne sont accessibles que via le serveur de l'application. C'est de la
-- défense en profondeur au cas où la clé anon/publique serait un jour exposée.
alter table settings enable row level security;
alter table members enable row level security;
alter table monthly_results enable row level security;
alter table investment_events enable row level security;

-- Bucket de stockage privé pour les PDF de bilans mensuels.
insert into storage.buckets (id, name, public)
values ('bilans', 'bilans', false)
on conflict (id) do nothing;
