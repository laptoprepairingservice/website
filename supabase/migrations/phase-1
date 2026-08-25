-- ============================================================================
-- PHASE 1: FOUNDATION
-- auth.users (built-in) + profiles
-- ============================================================================
-- ----------------------------------------------------------------------------
-- 1. Reusable function to auto-update `updated_at` columns
--    (used by profiles now, and by nearly every future table)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at () returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. profiles table
--    1:1 extension of auth.users for app-specific fields
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Application-specific user data, 1:1 with auth.users';

comment on column public.profiles.role is 'customer or admin — used by RLS policies';

-- Keep updated_at fresh on every update
drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at before
update on public.profiles for each row
execute function public.set_updated_at ();

-- ----------------------------------------------------------------------------
-- 3. Auto-create a profile row whenever a new auth.users row is created
--    This is the standard Supabase pattern — sign-up automatically
--    provisions a matching profile with no extra client-side call.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function public.handle_new_user ();

-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Helper: is the current user an admin?
-- (security definer avoids infinite recursion when checked from other RLS
--  policies that reference profiles)
create or replace function public.is_admin () returns boolean language sql security definer
set
  search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Customers can read their own profile
create policy "profiles_select_own" on public.profiles for
select
  using (auth.uid () = id);

-- Admins can read every profile
create policy "profiles_select_admin" on public.profiles for
select
  using (public.is_admin ());

-- Customers can update their own profile, but never change their own role
create policy "profiles_update_own" on public.profiles
for update
  using (auth.uid () = id)
with
  check (
    auth.uid () = id
    and role = (
      select
        role
      from
        public.profiles
      where
        id = auth.uid ()
    )
  );

-- Admins can update any profile (including role)
create policy "profiles_update_admin" on public.profiles
for update
  using (public.is_admin ())
with
  check (public.is_admin ());

-- No public insert/delete policies: rows are created only by the
-- handle_new_user trigger (security definer) and deleted via the
-- auth.users cascade — never directly by clients.
-- ----------------------------------------------------------------------------
-- 5. Index
-- ----------------------------------------------------------------------------
create index if not exists idx_profiles_role on public.profiles (role);