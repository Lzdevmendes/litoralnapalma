-- 1. Adiciona agreed_to_terms + user_id à tabela reports
-- 2. Corrige increment_report_upvote para usar report_upvotes (anti-duplicata real)
-- 3. Restringe insert a agreed_to_terms = true (policy server-side)

-- ── reports: novos campos ────────────────────────────────────────────────────

alter table reports
  add column if not exists agreed_to_terms boolean not null default true,
  add column if not exists user_id         uuid references auth.users(id) on delete set null;

-- Garante que nenhum insert burla o termo no banco (defense-in-depth)
alter table reports
  drop constraint if exists reports_agreed_to_terms_check;
alter table reports
  add constraint reports_agreed_to_terms_check check (agreed_to_terms = true);

-- Índice para "meus reports" e auditoria
create index if not exists reports_user_id_idx on reports (user_id);

-- ── Política de insert: exige agreed_to_terms e usuário autenticado ──────────

drop policy if exists "reports_insert" on reports;
create policy "reports: auth insert" on reports
  for insert
  with check (
    auth.role() = 'authenticated'
    and agreed_to_terms = true
  );

-- ── Corrige increment_report_upvote: usa report_upvotes para dedupe real ──────
-- A tabela report_upvotes já existe com PK (report_id, user_id) e RLS.

create or replace function increment_report_upvote(report_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_affected integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Insere linha de dedupe; on conflict do nothing = não lança erro se já votou
  insert into report_upvotes (report_id, user_id)
  values (increment_report_upvote.report_id, auth.uid())
  on conflict do nothing;

  get diagnostics rows_affected = row_count;

  -- Só incrementa se o voto foi de fato registrado (linha nova)
  if rows_affected > 0 then
    update reports
      set upvotes = upvotes + 1
    where id = increment_report_upvote.report_id
      and expires_at > now();
  end if;

  return rows_affected > 0;
end;
$$;

-- Somente autenticados podem votar
revoke execute on function increment_report_upvote(uuid) from public, anon;
grant  execute on function increment_report_upvote(uuid) to authenticated;
