-- Adiciona SET search_path = public nas functions SECURITY DEFINER restantes.
-- Elimina o warning do linter do Supabase sobre search_path mutável.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace function handle_upvote_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reports set upvotes = upvotes + 1 where id = new.report_id;
  return new;
end;
$$;

create or replace function handle_upvote_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reports set upvotes = greatest(0, upvotes - 1) where id = old.report_id;
  return old;
end;
$$;
