-- Tabela de reports da comunidade
-- Reports expiram automaticamente em 24h via campo expires_at

create table if not exists reports (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('lotacao_praia','acidente','blitz','falta_agua','falta_luz','outro')),
  description text,
  lat         double precision not null,
  lng         double precision not null,
  city        text not null,
  upvotes     integer not null default 0,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '24 hours')
);

create index if not exists reports_city_idx       on reports (city);
create index if not exists reports_expires_at_idx on reports (expires_at);

alter table reports enable row level security;

create policy "reports_select" on reports
  for select using (expires_at > now());

create policy "reports_insert" on reports
  for insert with check (true);
