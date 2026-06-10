-- Função atômica para incrementar upvotes (versão original — sem dedupe)
-- Substituída por increment_report_upvote com dedupe real em 20260610215000

create or replace function increment_report_upvote(report_id uuid)
returns void
language sql
security definer
as $$
  update reports set upvotes = upvotes + 1 where id = report_id;
$$;
