-- Permite que um usuário autenticado delete sua própria conta.
-- SECURITY DEFINER: executa com privilégios do owner (postgres) para operar em auth.users.
-- Acesso restrito a usuários autenticados; auth.uid() garante que só deleta a si mesmo.

create or replace function delete_user()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Anonimiza reports vinculados ao user (preserva dado comunitário, remove PII)
  update public.reports
    set user_id = null
  where user_id = auth.uid();

  -- Remove upvotes do usuário
  delete from public.report_upvotes where user_id = auth.uid();

  -- Remove perfil
  delete from public.profiles where id = auth.uid();

  -- Remove o usuário do sistema de auth
  delete from auth.users where id = auth.uid();
end;
$$;

-- Somente usuários autenticados podem invocar
revoke execute on function delete_user() from public, anon;
grant  execute on function delete_user() to authenticated;
