-- ============================================================================
-- 04. SHOPPING SCHEMA
-- addresses, carts, cart_items, wishlists, wishlist_items
-- ============================================================================
-- Description:
--   Customer shopping lifecycle tables managing user addresses, persistent carts,
--   cart items, and multi-list wishlists with shareable public registry links.
--
-- Features:
--   - Direct Foreign Key references to `auth.users(id)` (no intermediary profiles table).
--   - Auto-unset default triggers for user addresses and wishlists.
--   - Single persistent cart per user account, updated automatically on item modifications.
--   - Shareable wishlists via unique `share_token` with RLS allowing read access.
--   - Full RLS protection using subquery-cached authentication identifiers.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. addresses
-- ----------------------------------------------------------------------------
create table if not exists public.addresses (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  user_id uuid not null references auth.users(id) on delete cascade,

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

comment on table public.addresses is 'Saved customer delivery and billing addresses';
comment on column public.addresses.public_id is 'URL-safe identifier for address routes and client APIs';

drop trigger if exists set_addresses_updated_at on public.addresses;
create trigger set_addresses_updated_at
  before update on public.addresses
  for each row
  execute function public.set_updated_at();

create index if not exists idx_addresses_user_id on public.addresses(user_id);
create unique index if not exists uq_addresses_public_id on public.addresses(public_id);

-- Enforce single default address per user
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

  user_id uuid not null unique references auth.users(id) on delete cascade,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.carts is 'Persistent user shopping carts (1:1 with user)';

drop trigger if exists set_carts_updated_at on public.carts;
create trigger set_carts_updated_at
  before update on public.carts
  for each row
  execute function public.set_updated_at();

create index if not exists idx_carts_updated_at on public.carts(updated_at);

-- ----------------------------------------------------------------------------
-- 3. cart_items
-- ----------------------------------------------------------------------------
create table if not exists public.cart_items (
  id bigint generated always as identity primary key,

  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id bigint not null references public.product_variants(id),

  quantity integer not null check (quantity > 0 and quantity <= 999),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (cart_id, variant_id)
);

comment on table public.cart_items is 'Live cart items referencing active variants (prices dynamically read from product_variants)';

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
  before update on public.cart_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);

-- Bump cart updated_at whenever an item is added, updated, or deleted
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

  user_id uuid not null references auth.users(id) on delete cascade,

  name text not null default 'My Wishlist',
  is_default boolean not null default false,

  is_public boolean not null default false,
  share_token uuid not null unique default gen_random_uuid(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.wishlists is 'Customer wishlists supporting custom naming and public gift-registry sharing';

drop trigger if exists set_wishlists_updated_at on public.wishlists;
create trigger set_wishlists_updated_at
  before update on public.wishlists
  for each row
  execute function public.set_updated_at();

create index if not exists idx_wishlists_user_id on public.wishlists(user_id);

-- Enforce single default wishlist per user
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

  note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (wishlist_id, product_id)
);

comment on table public.wishlist_items is 'Product-level bookmarks inside a customer wishlist';

drop trigger if exists set_wishlist_items_updated_at on public.wishlist_items;
create trigger set_wishlist_items_updated_at
  before update on public.wishlist_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_wishlist_items_wishlist_id on public.wishlist_items(wishlist_id);
create index if not exists idx_wishlist_items_product_id on public.wishlist_items(product_id);

-- ============================================================================
-- 6. Row Level Security (Shopping)
-- ============================================================================
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;

-- addresses
create policy "addresses_select_own" on public.addresses
  for select using (user_id = (select auth.uid()));

create policy "addresses_select_admin" on public.addresses
  for select using ((select public.is_admin()));

create policy "addresses_insert_own" on public.addresses
  for insert with check (user_id = (select auth.uid()));

create policy "addresses_update_own" on public.addresses
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "addresses_delete_own" on public.addresses
  for delete using (user_id = (select auth.uid()));

-- carts
create policy "carts_select_own" on public.carts
  for select using (user_id = (select auth.uid()));

create policy "carts_select_admin" on public.carts
  for select using ((select public.is_admin()));

create policy "carts_update_own" on public.carts
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- cart_items
create policy "cart_items_select_own" on public.cart_items
  for select using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );

create policy "cart_items_select_admin" on public.cart_items
  for select using ((select public.is_admin()));

create policy "cart_items_insert_own" on public.cart_items
  for insert with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );

create policy "cart_items_update_own" on public.cart_items
  for update using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );

create policy "cart_items_delete_own" on public.cart_items
  for delete using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );

-- wishlists
create policy "wishlists_select_own" on public.wishlists
  for select using (user_id = (select auth.uid()));

create policy "wishlists_select_public" on public.wishlists
  for select using (is_public = true);

create policy "wishlists_select_admin" on public.wishlists
  for select using ((select public.is_admin()));

create policy "wishlists_insert_own" on public.wishlists
  for insert with check (user_id = (select auth.uid()));

create policy "wishlists_update_own" on public.wishlists
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "wishlists_delete_own" on public.wishlists
  for delete using (user_id = (select auth.uid()));

-- wishlist_items
create policy "wishlist_items_select_own" on public.wishlist_items
  for select using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );

create policy "wishlist_items_select_public" on public.wishlist_items
  for select using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.is_public = true
    )
  );

create policy "wishlist_items_insert_own" on public.wishlist_items
  for insert with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );

create policy "wishlist_items_update_own" on public.wishlist_items
  for update using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );

create policy "wishlist_items_delete_own" on public.wishlist_items
  for delete using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );
