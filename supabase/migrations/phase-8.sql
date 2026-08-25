-- ============================================================================
-- PHASE 8: Drop public.profiles
--   Identity: user_metadata (first_name, last_name, phone) — client-editable
--   Role:     app_metadata.role (customer | admin) — NOT client-editable
--   FKs:      carts / wishlists / addresses / orders → auth.users(id)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Backfill auth metadata from profiles (safe if phase 7 already dropped
--    the name columns)
-- ----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'first_name'
  ) then
    update auth.users u
    set
      raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb)
      || jsonb_strip_nulls(
        jsonb_build_object(
          'first_name', coalesce(
            nullif(trim(u.raw_user_meta_data ->> 'first_name'), ''),
            nullif(trim(p.first_name), '')
          ),
          'last_name', coalesce(
            nullif(trim(u.raw_user_meta_data ->> 'last_name'), ''),
            nullif(trim(p.last_name), '')
          ),
          'phone', coalesce(
            nullif(trim(u.raw_user_meta_data ->> 'phone'), ''),
            nullif(trim(p.phone), '')
          )
        )
      )
    from public.profiles p
    where p.id = u.id;
  end if;
end;
$$;

update auth.users u
set
  raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', coalesce(p.role, 'customer'))
from public.profiles p
where p.id = u.id;

update auth.users
set
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'customer')
where coalesce(raw_app_meta_data ->> 'role', '') = '';

-- ----------------------------------------------------------------------------
-- 2. is_admin() reads app_metadata on auth.users (security definer so it can
--    see auth.users). Users cannot set app_metadata via updateUser().
-- ----------------------------------------------------------------------------
create or replace function public.is_admin () returns boolean language sql security definer
set
  search_path = public stable as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and coalesce(raw_app_meta_data ->> 'role', '') = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. Move provisioning onto auth.users, then drop the profiles FKs
-- ----------------------------------------------------------------------------
drop trigger if exists on_profile_created on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists trg_set_default_app_role on auth.users;

create or replace function public.set_default_app_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'role', '') = '' then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
      || '{"role": "customer"}'::jsonb;
  end if;
  return new;
end;
$$;

create trigger trg_set_default_app_role
  before insert on auth.users
  for each row
  execute function public.set_default_app_role();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.carts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.wishlists (user_id, name, is_default)
  select new.id, 'My Wishlist', true
  where not exists (
    select 1 from public.wishlists w where w.user_id = new.id
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

do $$
declare
  r record;
begin
  for r in
    select rel.relname as table_name, con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    join pg_class frel on frel.oid = con.confrelid
    join pg_namespace fnsp on fnsp.oid = frel.relnamespace
    where con.contype = 'f'
      and nsp.nspname = 'public'
      and fnsp.nspname = 'public'
      and frel.relname = 'profiles'
  loop
    execute format('alter table public.%I drop constraint %I', r.table_name, r.conname);
  end loop;
end;
$$;

alter table public.addresses drop constraint if exists addresses_user_id_fkey;
alter table public.addresses
  add constraint addresses_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table public.carts drop constraint if exists carts_user_id_fkey;
alter table public.carts
  add constraint carts_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table public.wishlists drop constraint if exists wishlists_user_id_fkey;
alter table public.wishlists
  add constraint wishlists_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete cascade;

alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references auth.users (id);

drop function if exists public.create_profile_for_auth_user();
drop table if exists public.profiles;
