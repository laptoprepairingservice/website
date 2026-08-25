-- ============================================================================
-- PHASE 4: SHOPPING
-- addresses, carts, cart_items, wishlists, wishlist_items
--
-- Beyond the basic sketch, this migration adds:
--   - addresses: a `label` field, a `landmark` field (standard on Indian
--     address forms), and the same auto-unset-previous-default pattern
--     used for variants/images in Phase 2
--   - carts: unique(user_id) — one persistent cart per account, reused
--     across sessions rather than piling up cart rows — plus a trigger
--     that bumps the cart's updated_at whenever its items change, useful
--     later for abandoned-cart queries
--   - wishlists: support for multiple named lists per user (not just one),
--     a default list auto-provisioned at signup, and optional public
--     sharing via a share_token (a gift-registry-style link)
--   - handle_new_user() (from Phase 1) is extended here to also provision
--     a cart and a default wishlist for every new signup — plus a one-time
--     backfill for any accounts created before this migration ran
--   - Guest checkout note: rather than inventing a separate session-token
--     cart with its own fragile RLS, use Supabase Anonymous Sign-ins
--     (auth.signInAnonymously()). That still creates a real auth.users row,
--     which flows through the same handle_new_user() trigger and gets a
--     normal cart — and linkIdentity() later merges it into a permanent
--     account without losing the cart.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. addresses
-- ----------------------------------------------------------------------------
create table if not exists public.addresses (
  id bigint generated always as identity primary key,

  user_id uuid not null references public.profiles(id) on delete cascade,

  label text,                 -- e.g. "Home", "Office"

  full_name text not null,
  phone text not null,

  address_line1 text not null,
  address_line2 text,
  landmark text,

  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',

  is_default boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_addresses_updated_at on public.addresses;
create trigger set_addresses_updated_at
  before update on public.addresses
  for each row
  execute function public.set_updated_at();

create index if not exists idx_addresses_user_id on public.addresses(user_id);

create or replace function public.enforce_single_default_address()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.addresses
    set is_default = false
    where user_id = new.user_id
      and id <> coalesce(new.id, -1)
      and is_default = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_single_default_address on public.addresses;
create trigger trg_single_default_address
  before insert or update of is_default on public.addresses
  for each row
  when (new.is_default = true)
  execute function public.enforce_single_default_address();

create unique index if not exists uq_addresses_default_per_user
  on public.addresses(user_id)
  where is_default = true;

-- ----------------------------------------------------------------------------
-- 2. carts
-- ----------------------------------------------------------------------------
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique references public.profiles(id) on delete cascade,
  -- unique: exactly one persistent cart per account, cleared (not deleted)
  -- on checkout and reused for the next shopping session

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at
  before update on public.carts
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. cart_items
-- ----------------------------------------------------------------------------
create table if not exists public.cart_items (
  id bigint generated always as identity primary key,

  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id bigint not null references public.product_variants(id),
  -- no ON DELETE cascade/restrict override here — same principle as
  -- elsewhere: variants with any real-world references should be archived
  -- (is_active = false), not hard-deleted

  quantity integer not null check (quantity > 0 and quantity <= 999),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (cart_id, variant_id)
);

comment on table public.cart_items is 'Prices are NOT snapshotted here — always reflects the variant''s live price. Snapshotting happens at order_items, post-purchase.';

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
  before update on public.cart_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);

-- Bump the parent cart's updated_at whenever its items change — gives you
-- a cheap way to find abandoned carts later (e.g. updated_at < now() - '2 days').
create or replace function public.touch_cart_on_item_change()
returns trigger
language plpgsql
as $$
begin
  update public.carts
  set updated_at = now()
  where id = coalesce(new.cart_id, old.cart_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_touch_cart_on_item_change on public.cart_items;
create trigger trg_touch_cart_on_item_change
  after insert or update or delete on public.cart_items
  for each row
  execute function public.touch_cart_on_item_change();

-- ----------------------------------------------------------------------------
-- 4. wishlists
-- ----------------------------------------------------------------------------
create table if not exists public.wishlists (
  id bigint generated always as identity primary key,

  user_id uuid not null references public.profiles(id) on delete cascade,

  name text not null default 'My Wishlist',
  -- multiple named lists are supported (e.g. "Birthday build", "Office
  -- upgrade") — not forced into a single list per user

  is_default boolean not null default false,

  is_public boolean not null default false,
  share_token uuid not null unique default gen_random_uuid(),
  -- when is_public = true, anyone with a link built from share_token can
  -- view the list read-only (gift-registry style) — see RLS below

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_wishlists_updated_at on public.wishlists;
create trigger set_wishlists_updated_at
  before update on public.wishlists
  for each row
  execute function public.set_updated_at();

create index if not exists idx_wishlists_user_id on public.wishlists(user_id);

create or replace function public.enforce_single_default_wishlist()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.wishlists
    set is_default = false
    where user_id = new.user_id
      and id <> coalesce(new.id, -1)
      and is_default = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_single_default_wishlist on public.wishlists;
create trigger trg_single_default_wishlist
  before insert or update of is_default on public.wishlists
  for each row
  when (new.is_default = true)
  execute function public.enforce_single_default_wishlist();

create unique index if not exists uq_wishlists_default_per_user
  on public.wishlists(user_id)
  where is_default = true;

-- ----------------------------------------------------------------------------
-- 5. wishlist_items
-- ----------------------------------------------------------------------------
create table if not exists public.wishlist_items (
  id bigint generated always as identity primary key,

  wishlist_id bigint not null references public.wishlists(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  -- product-level, not variant-level: the shopper picks the exact variant
  -- (e.g. capacity) when they're ready to actually buy it

  note text,                  -- e.g. "need this for the Dell build"

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (wishlist_id, product_id)
);

drop trigger if exists set_wishlist_items_updated_at on public.wishlist_items;
create trigger set_wishlist_items_updated_at
  before update on public.wishlist_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_wishlist_items_wishlist_id on public.wishlist_items(wishlist_id);
create index if not exists idx_wishlist_items_product_id on public.wishlist_items(product_id);

-- ----------------------------------------------------------------------------
-- 6. Extend handle_new_user() (defined in Phase 1) to also provision a
--    cart and a default wishlist for every new signup, now that those
--    tables exist. CREATE OR REPLACE on the same function name/trigger —
--    no need to touch the Phase 1 file.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );

  insert into public.carts (user_id) values (new.id);

  insert into public.wishlists (user_id, name, is_default)
  values (new.id, 'My Wishlist', true);

  return new;
end;
$$;

-- Backfill for any accounts created before this migration existed.
insert into public.carts (user_id)
select p.id from public.profiles p
on conflict (user_id) do nothing;

insert into public.wishlists (user_id, name, is_default)
select p.id, 'My Wishlist', true
from public.profiles p
where not exists (
  select 1 from public.wishlists w where w.user_id = p.id
);

-- ============================================================================
-- 7. Row Level Security
-- ============================================================================
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;

-- addresses: owner has full CRUD; admin gets read-only visibility for
-- order/support purposes, never write (avoids admin silently altering a
-- customer's saved address)
create policy "addresses_select_own" on public.addresses
  for select using (user_id = auth.uid());
create policy "addresses_select_admin" on public.addresses
  for select using (public.is_admin());
create policy "addresses_insert_own" on public.addresses
  for insert with check (user_id = auth.uid());
create policy "addresses_update_own" on public.addresses
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses_delete_own" on public.addresses
  for delete using (user_id = auth.uid());

-- carts: owner can view/touch their own; no insert/delete policy for
-- anyone — the row is created only by handle_new_user() and removed only
-- via the profile's cascade
create policy "carts_select_own" on public.carts
  for select using (user_id = auth.uid());
create policy "carts_select_admin" on public.carts
  for select using (public.is_admin());
create policy "carts_update_own" on public.carts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- cart_items: owner manages items in their own cart, checked via the
-- parent cart's user_id since cart_items has no user_id of its own
create policy "cart_items_select_own" on public.cart_items
  for select using (
    exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );
create policy "cart_items_select_admin" on public.cart_items
  for select using (public.is_admin());
create policy "cart_items_insert_own" on public.cart_items
  for insert with check (
    exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );
create policy "cart_items_update_own" on public.cart_items
  for update using (
    exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );
create policy "cart_items_delete_own" on public.cart_items
  for delete using (
    exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid())
  );

-- wishlists: owner CRUD, plus anyone can read a wishlist explicitly marked
-- public (the share-link feature)
create policy "wishlists_select_own" on public.wishlists
  for select using (user_id = auth.uid());
create policy "wishlists_select_public" on public.wishlists
  for select using (is_public = true);
create policy "wishlists_select_admin" on public.wishlists
  for select using (public.is_admin());
create policy "wishlists_insert_own" on public.wishlists
  for insert with check (user_id = auth.uid());
create policy "wishlists_update_own" on public.wishlists
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wishlists_delete_own" on public.wishlists
  for delete using (user_id = auth.uid());

-- wishlist_items: same pattern — owner CRUD via parent wishlist ownership,
-- plus public read when the parent wishlist is public
create policy "wishlist_items_select_own" on public.wishlist_items
  for select using (
    exists (select 1 from public.wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
  );
create policy "wishlist_items_select_public" on public.wishlist_items
  for select using (
    exists (select 1 from public.wishlists w where w.id = wishlist_items.wishlist_id and w.is_public = true)
  );
create policy "wishlist_items_insert_own" on public.wishlist_items
  for insert with check (
    exists (select 1 from public.wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
  );
create policy "wishlist_items_update_own" on public.wishlist_items
  for update using (
    exists (select 1 from public.wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
  );
create policy "wishlist_items_delete_own" on public.wishlist_items
  for delete using (
    exists (select 1 from public.wishlists w where w.id = wishlist_items.wishlist_id and w.user_id = auth.uid())
  );