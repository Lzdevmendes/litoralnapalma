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

-- Índices para filtros comuns
create index if not exists reports_city_idx       on reports (city);
create index if not exists reports_expires_at_idx on reports (expires_at);

-- Habilita Row Level Security
alter table reports enable row level security;

-- Leitura pública de reports não expirados
create policy "reports_select" on reports
  for select using (expires_at > now());

-- Inserção pública (qualquer usuário pode reportar)
create policy "reports_insert" on reports
  for insert with check (true);

-- Função atômica para incrementar upvotes
create or replace function increment_report_upvote(report_id uuid)
returns void
language sql
security definer
as $$
  update reports set upvotes = upvotes + 1 where id = report_id;
$$;
