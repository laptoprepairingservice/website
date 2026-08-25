-- ============================================================================
-- PHASE 7: Identity lives in auth user_metadata
--   first_name, last_name, and phone are stored on auth.users.raw_user_meta_data
--   (user_metadata). public.profiles keeps only role + timestamps — that field
--   must stay in a public table because RLS (is_admin) cannot trust metadata
--   the user can edit themselves.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Copy any profile identity fields that are missing from metadata
-- ----------------------------------------------------------------------------
update auth.users u
set
  raw_user_meta_data = coalesce(u.raw_user_meta_data, '{}'::jsonb) || jsonb_strip_nulls(
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

-- ----------------------------------------------------------------------------
-- 2. Profile row is now id + role only (carts/wishlists still key off id)
-- ----------------------------------------------------------------------------
create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

alter table public.profiles
  drop column if exists first_name,
  drop column if exists last_name,
  drop column if exists phone;

comment on table public.profiles is
  'App role for RLS, 1:1 with auth.users. Name and phone live in auth user_metadata.';
