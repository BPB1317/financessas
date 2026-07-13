-- Date de référence pour le calcul de "performance nette" affiché sur la
-- page Ma performance : rendement net composé (dividende du mois / capital
-- en début de mois) depuis cette date, modifiable dans Admin > Paramètres.
alter table settings
  add column performance_start_date date not null default '2026-07-01';
