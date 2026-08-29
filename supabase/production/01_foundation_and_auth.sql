-- ============================================================================
-- 01. FOUNDATION, HELPERS & AUTH LIFECYCLE
-- ============================================================================
-- Description:
--   Core extensions, reusable helper functions, order sequence generator,
--   and auth lifecycle triggers on `auth.users`.
--
-- Key Highlights:
--   - Role management is purely via `auth.users.raw_app_meta_data ->> 'role'`
--     ('customer' | 'admin'). This is safe against client tampering.
--   - Personal info (first_name, last_name, phone) lives in `raw_user_meta_data`.
--   - Every new user automatically receives a default 'customer' role, a
--     persistent shopping cart, and a default wishlist.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Timestamp Auto-updater Function
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is 'Reusable trigger function to automatically update updated_at timestamp columns';

-- ----------------------------------------------------------------------------
-- 2. Admin Check Helper (Security Definer)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and coalesce(raw_app_meta_data ->> 'role', '') = 'admin'
  );
$$;

comment on function public.is_admin() is 'Returns true if the authenticated user has role=admin in raw_app_meta_data';

-- ----------------------------------------------------------------------------
-- 3. Order Number Sequence & Generator
-- ----------------------------------------------------------------------------
create sequence if not exists public.order_number_seq;

create or replace function public.generate_order_number()
returns text
language sql
as $$
  select 'ORD-' || to_char(now(), 'YYYYMMDD') || '-'
    || lpad(nextval('public.order_number_seq')::text, 6, '0');
$$;

comment on function public.generate_order_number() is 'Generates standard order number formatted as ORD-YYYYMMDD-000001';

-- ----------------------------------------------------------------------------
-- 4. Auth User Provisioning Triggers
-- ----------------------------------------------------------------------------

-- Ensure new users always have an app_metadata role defaulted to 'customer'
create or replace function public.set_default_app_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'role', '') = '' then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
      || '{"role": "customer"}'::jsonb;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_default_app_role on auth.users;
create trigger trg_set_default_app_role
  before insert on auth.users
  for each row
  execute function public.set_default_app_role();

-- Auto-provision cart and default wishlist on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Auto-create persistent user cart
  insert into public.carts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  -- Auto-create default wishlist
  insert into public.wishlists (user_id, name, is_default)
  select new.id, 'My Wishlist', true
  where not exists (
    select 1 from public.wishlists w where w.user_id = new.id
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
