-- Permet de "camoufler" un mouvement d'investissement de l'historique visible
-- par les membres (page /investissements) sans le supprimer : il continue de
-- compter normalement dans tous les calculs (investissement, dividendes,
-- réinvestissement). Reste toujours visible dans l'admin.
alter table investment_events add column hidden boolean not null default false;
