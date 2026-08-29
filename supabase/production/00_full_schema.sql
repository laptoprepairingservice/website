-- ============================================================================
-- SUPABASE PRODUCTION DATABASE SETUP
-- Full Consolidated E-Commerce & Service Architecture (Phases 1-9)
-- ============================================================================
-- Version: 1.0.0 (Production Master)
-- Target: PostgreSQL / Supabase
--
-- Contents:
--   1. Foundations & Security Helpers (is_admin, set_updated_at, order seq)
--   2. Catalog Architecture (categories, brands, products, variants, images)
--   3. Inventory & Ledger Engine (inventory, movements, stock status view)
--   4. Shopping Experience (addresses, carts, cart_items, wishlists)
--   5. Orders & Checkout Engine (orders, order_items, status history, RPCs)
--   6. Auth Lifecycle Provisions (app_metadata role default, cart/wishlist provisioning)
-- ============================================================================

-- ============================================================================
-- SECTION 1: FOUNDATION & SECURITY HELPERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 Timestamp Auto-updater Function
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

comment on function public.set_updated_at() is 'Reusable trigger to update updated_at timestamp columns';

-- ----------------------------------------------------------------------------
-- 1.2 Admin Authorization Helper (Security Definer)
-- ----------------------------------------------------------------------------
-- Checks raw_app_meta_data on auth.users for role = 'admin'.
-- Security definer ensures safe evaluation without infinite recursion.
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

comment on function public.is_admin() is 'Returns true if the active user has role=admin in raw_app_meta_data';

-- ----------------------------------------------------------------------------
-- 1.3 Order Number Sequence & Generator
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


-- ============================================================================
-- SECTION 2: CATALOG ARCHITECTURE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  parent_id bigint references public.categories(id) on delete set null,

  name text not null,
  slug text not null unique,
  description text,

  image_path text,          -- Supabase Storage path
  sort_order integer not null default 0,
  is_active boolean not null default true,

  meta_title text,
  meta_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (id is distinct from parent_id)
);

comment on table public.categories is 'Hierarchical product categories';
comment on column public.categories.public_id is 'URL-safe identifier for category routes and external APIs';

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_categories_active on public.categories(is_active);
create unique index if not exists uq_categories_public_id on public.categories(public_id);

-- ----------------------------------------------------------------------------
-- 2.2 brands
-- ----------------------------------------------------------------------------
create table if not exists public.brands (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  name text not null unique,
  slug text not null unique,

  logo_path text,            -- Supabase Storage path
  website_url text,
  description text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.brands is 'Manufacturer and brand directory';
comment on column public.brands.public_id is 'URL-safe identifier for brand routes and external APIs';

drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at
  before update on public.brands
  for each row
  execute function public.set_updated_at();

create unique index if not exists uq_brands_public_id on public.brands(public_id);

-- ----------------------------------------------------------------------------
-- 2.3 products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  category_id bigint not null references public.categories(id),
  brand_id bigint references public.brands(id),

  name text not null,
  slug text not null unique,

  short_description text,
  description text,

  sku text unique,

  is_oem boolean not null default true,

  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),

  is_featured boolean not null default false,

  meta_title text,
  meta_description text,

  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is 'Main product catalog';
comment on column public.products.public_id is 'URL-safe identifier for storefront and admin routes';

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_brand_id on public.products(brand_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_status_category on public.products(status, category_id);
create index if not exists idx_products_search_vector on public.products using gin(search_vector);
create unique index if not exists uq_products_public_id on public.products(public_id);

-- ----------------------------------------------------------------------------
-- 2.4 product_variants
-- ----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  product_id bigint not null references public.products(id) on delete cascade,

  sku text not null unique,
  barcode text,

  variant_name text,
  options jsonb not null default '{}'::jsonb,

  condition text not null default 'new'
    check (condition in ('new', 'refurbished', 'used')),

  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2)
    check (compare_at_price is null or compare_at_price >= price),
  cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),

  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  length_mm integer check (length_mm is null or length_mm >= 0),
  width_mm integer check (width_mm is null or width_mm >= 0),
  height_mm integer check (height_mm is null or height_mm >= 0),

  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_variants is 'SKU-level variants with prices, dimensions, and options';
comment on column public.product_variants.public_id is 'URL-safe identifier for variant-specific routes and APIs';

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
  before update on public.product_variants
  for each row
  execute function public.set_updated_at();

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_variants_active on public.product_variants(is_active);
create index if not exists idx_product_variants_product_active on public.product_variants(product_id, is_active);
create unique index if not exists uq_product_variants_public_id on public.product_variants(public_id);

-- Enforce single default variant per product
create or replace function public.enforce_single_default_variant()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.product_variants
    set is_default = false
    where product_id = new.product_id
      and id <> coalesce(new.id, -1)
      and is_default = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_single_default_variant on public.product_variants;
create trigger trg_single_default_variant
  before insert or update of is_default on public.product_variants
  for each row
  when (new.is_default = true)
  execute function public.enforce_single_default_variant();

create unique index if not exists uq_product_variants_default_per_product
  on public.product_variants(product_id)
  where is_default = true;

-- ----------------------------------------------------------------------------
-- 2.5 product_images
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id bigint generated always as identity primary key,

  product_id bigint not null references public.products(id) on delete cascade,
  variant_id bigint references public.product_variants(id) on delete set null,

  storage_path text not null,
  alt_text text,

  width integer,
  height integer,

  sort_order integer not null default 0,
  is_primary boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_images is 'Image gallery for products and specific variants';

drop trigger if exists set_product_images_updated_at on public.product_images;
create trigger set_product_images_updated_at
  before update on public.product_images
  for each row
  execute function public.set_updated_at();

create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_variant_id on public.product_images(variant_id);

-- Enforce single primary image per product
create or replace function public.enforce_single_primary_image()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    update public.product_images
    set is_primary = false
    where product_id = new.product_id
      and id <> coalesce(new.id, -1)
      and is_primary = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_single_primary_image on public.product_images;
create trigger trg_single_primary_image
  before insert or update of is_primary on public.product_images
  for each row
  when (new.is_primary = true)
  execute function public.enforce_single_primary_image();

create unique index if not exists uq_product_images_primary_per_product
  on public.product_images(product_id)
  where is_primary = true;

-- ----------------------------------------------------------------------------
-- 2.6 Catalog RLS
-- ----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

-- categories
create policy "categories_select_public"
  on public.categories for select
  using (is_active = true);

create policy "categories_all_admin"
  on public.categories for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- brands
create policy "brands_select_public"
  on public.brands for select
  using (is_active = true);

create policy "brands_all_admin"
  on public.brands for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- products
create policy "products_select_public"
  on public.products for select
  using (status = 'active');

create policy "products_all_admin"
  on public.products for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- product_variants
create policy "product_variants_select_public"
  on public.product_variants for select
  using (
    is_active = true
    and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and p.status = 'active'
    )
  );

create policy "product_variants_all_admin"
  on public.product_variants for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- product_images
create policy "product_images_select_public"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.status = 'active'
    )
  );

create policy "product_images_all_admin"
  on public.product_images for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));


-- ============================================================================
-- SECTION 3: INVENTORY & LEDGER ENGINE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 inventory
-- ----------------------------------------------------------------------------
create table if not exists public.inventory (
  variant_id bigint primary key
    references public.product_variants(id) on delete cascade,

  quantity integer not null default 0,
  reserved_quantity integer not null default 0,

  available_quantity integer generated always as (quantity - reserved_quantity) stored,

  low_stock_threshold integer not null default 5,

  updated_at timestamptz not null default now(),

  check (quantity >= 0),
  check (reserved_quantity >= 0),
  check (reserved_quantity <= quantity)
);

comment on table public.inventory is 'Physical stock cache. Direct updates blocked — apply movements via inventory_movements.';

drop trigger if exists set_inventory_updated_at on public.inventory;
create trigger set_inventory_updated_at
  before update on public.inventory
  for each row
  execute function public.set_updated_at();

create index if not exists idx_inventory_available_quantity on public.inventory(available_quantity);

-- Block direct edits to inventory.quantity
create or replace function public.prevent_direct_quantity_change()
returns trigger
language plpgsql
as $$
begin
  if new.quantity is distinct from old.quantity and pg_trigger_depth() <= 1 then
    raise exception 'inventory.quantity cannot be changed directly — insert a row into inventory_movements instead';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_direct_quantity_change on public.inventory;
create trigger trg_prevent_direct_quantity_change
  before update of quantity on public.inventory
  for each row
  execute function public.prevent_direct_quantity_change();

-- Auto-provision an inventory row whenever a product variant is created
create or replace function public.create_inventory_row_for_variant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.inventory (variant_id) values (new.id)
  on conflict (variant_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_inventory_for_variant on public.product_variants;
create trigger trg_create_inventory_for_variant
  after insert on public.product_variants
  for each row
  execute function public.create_inventory_row_for_variant();

-- ----------------------------------------------------------------------------
-- 3.2 inventory_movements
-- ----------------------------------------------------------------------------
create table if not exists public.inventory_movements (
  id bigint generated always as identity primary key,

  variant_id bigint not null references public.product_variants(id),
  quantity_change integer not null check (quantity_change <> 0),

  movement_type text not null check (
    movement_type in ('purchase', 'sale', 'return', 'damaged', 'restock', 'adjustment')
  ),

  reference_type text check (reference_type in ('order', 'purchase_order', 'manual', 'other')),
  reference_id bigint,

  note text,

  created_by uuid references auth.users(id) default auth.uid(),

  created_at timestamptz not null default now()
);

comment on table public.inventory_movements is 'Append-only stock ledger — immutable audit trail.';

create index if not exists idx_inventory_movements_variant_id on public.inventory_movements(variant_id);
create index if not exists idx_inventory_movements_type on public.inventory_movements(movement_type);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);
create index if not exists idx_inventory_movements_reference on public.inventory_movements(reference_type, reference_id);

-- Apply inventory movement with row-level locking (FOR UPDATE)
create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_qty integer;
begin
  select quantity into current_qty
  from public.inventory
  where variant_id = new.variant_id
  for update;

  if current_qty is null then
    if new.quantity_change < 0 then
      raise exception 'Cannot create negative inventory for variant %', new.variant_id;
    end if;
    insert into public.inventory (variant_id, quantity)
    values (new.variant_id, new.quantity_change);
  else
    if current_qty + new.quantity_change < 0 then
      raise exception 'Insufficient stock for variant % (have %, requested change %)',
        new.variant_id, current_qty, new.quantity_change;
    end if;
    update public.inventory
    set quantity = current_qty + new.quantity_change
    where variant_id = new.variant_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_inventory_movement on public.inventory_movements;
create trigger trg_apply_inventory_movement
  after insert on public.inventory_movements
  for each row
  execute function public.apply_inventory_movement();

-- ----------------------------------------------------------------------------
-- 3.3 Inventory RLS
-- ----------------------------------------------------------------------------
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;

create policy "inventory_select_admin"
  on public.inventory for select
  using ((select public.is_admin()));

create policy "inventory_update_admin"
  on public.inventory for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "inventory_movements_select_admin"
  on public.inventory_movements for select
  using ((select public.is_admin()));

create policy "inventory_movements_insert_admin"
  on public.inventory_movements for insert
  with check ((select public.is_admin()));

-- ----------------------------------------------------------------------------
-- 3.4 Public Stock Status View
-- ----------------------------------------------------------------------------
create or replace view public.product_stock_status as
select
  i.variant_id,
  i.available_quantity
from public.inventory i
join public.product_variants v on v.id = i.variant_id
join public.products p on p.id = v.product_id
where v.is_active = true
  and p.status = 'active';

grant select on public.product_stock_status to anon, authenticated;


-- ============================================================================
-- SECTION 4: SHOPPING EXPERIENCE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 addresses
-- ----------------------------------------------------------------------------
create table if not exists public.addresses (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  user_id uuid not null references auth.users(id) on delete cascade,

  label text,
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
-- 4.2 carts
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
-- 4.3 cart_items
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

comment on table public.cart_items is 'Live cart items referencing active variants';

drop trigger if exists set_cart_items_updated_at on public.cart_items;
create trigger set_cart_items_updated_at
  before update on public.cart_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);

-- Touch cart updated_at on item change
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
-- 4.4 wishlists
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
-- 4.5 wishlist_items
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

-- ----------------------------------------------------------------------------
-- 4.6 Shopping RLS
-- ----------------------------------------------------------------------------
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


-- ============================================================================
-- SECTION 5: ORDERS & CHECKOUT ENGINE
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 orders
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  user_id uuid not null references auth.users(id),

  order_number text not null unique default public.generate_order_number(),

  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),

  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),

  check (total_amount = subtotal + shipping_amount + tax_amount - discount_amount),

  shipping_address jsonb not null,

  customer_note text,
  cancellation_reason text,
  cancelled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is 'Master order records with server-computed totals and snapshotted address';
comment on column public.orders.public_id is 'URL-safe identifier for account order detail routes (e.g. /account/orders/{public_id})';

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create unique index if not exists uq_orders_public_id on public.orders(public_id);

-- ----------------------------------------------------------------------------
-- 5.2 order_items
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id bigint generated always as identity primary key,

  order_id bigint not null references public.orders(id) on delete cascade,

  variant_id bigint references public.product_variants(id) on delete set null,

  product_name text not null,
  sku text,

  unit_price numeric(12,2) not null check (unit_price >= 0),
  compare_at_price numeric(12,2),
  check (compare_at_price is null or compare_at_price >= unit_price),

  quantity integer not null check (quantity > 0),

  subtotal numeric(12,2) not null check (subtotal >= 0),
  check (subtotal = unit_price * quantity),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.order_items is 'Snapshotted order line items and pricing';

drop trigger if exists set_order_items_updated_at on public.order_items;
create trigger set_order_items_updated_at
  before update on public.order_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_variant_id on public.order_items(variant_id);

-- ----------------------------------------------------------------------------
-- 5.3 order_status_history
-- ----------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,

  order_id bigint not null references public.orders(id) on delete cascade,
  status text not null,
  note text,

  changed_by uuid references auth.users(id),

  created_at timestamptz not null default now()
);

comment on table public.order_status_history is 'Append-only order lifecycle status audit log';

create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

-- ----------------------------------------------------------------------------
-- 5.4 Order Lifecycle Triggers
-- ----------------------------------------------------------------------------

-- Log initial status
create or replace function public.log_initial_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_status_history (order_id, status, changed_by)
  values (new.id, new.status, new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_log_initial_order_status on public.orders;
create trigger trg_log_initial_order_status
  after insert on public.orders
  for each row
  execute function public.log_initial_order_status();

-- Status transition handler
create or replace function public.handle_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  if new.status is distinct from old.status then

    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    -- Order confirmed: clear cart
    if new.status = 'confirmed' and old.status = 'pending' then
      delete from public.cart_items
      where cart_id = (
        select id from public.carts where user_id = new.user_id
      );
    end if;

    -- Order shipped: record sale and release hold
    if new.status = 'shipped' and old.status not in ('shipped', 'delivered') then
      for v_item in
        select variant_id, quantity from public.order_items where order_id = new.id
      loop
        insert into public.inventory_movements
          (variant_id, quantity_change, movement_type, reference_type, reference_id, note)
        values
          (v_item.variant_id, -v_item.quantity, 'sale', 'order', new.id,
           'Order ' || new.order_number || ' shipped');

        update public.inventory
        set reserved_quantity = reserved_quantity - v_item.quantity
        where variant_id = v_item.variant_id;
      end loop;
    end if;

    -- Order cancelled: release hold
    if new.status = 'cancelled' and old.status in ('pending', 'confirmed', 'processing') then
      for v_item in
        select variant_id, quantity from public.order_items where order_id = new.id
      loop
        update public.inventory
        set reserved_quantity = reserved_quantity - v_item.quantity
        where variant_id = v_item.variant_id;
      end loop;

      new.cancelled_at := coalesce(new.cancelled_at, now());
    end if;

  end if;

  return new;
end;
$$;

drop trigger if exists trg_handle_order_status_change on public.orders;
create trigger trg_handle_order_status_change
  before update of status on public.orders
  for each row
  execute function public.handle_order_status_change();

-- Reserve stock on item insert
create or replace function public.reserve_inventory_for_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer;
begin
  select available_quantity into v_available
  from public.inventory
  where variant_id = new.variant_id
  for update;

  if v_available is null or v_available < new.quantity then
    raise exception 'Insufficient stock for variant % (available %, requested %)',
      new.variant_id, coalesce(v_available, 0), new.quantity;
  end if;

  update public.inventory
  set reserved_quantity = reserved_quantity + new.quantity
  where variant_id = new.variant_id;

  return new;
end;
$$;

drop trigger if exists trg_reserve_inventory_for_order_item on public.order_items;
create trigger trg_reserve_inventory_for_order_item
  after insert on public.order_items
  for each row
  execute function public.reserve_inventory_for_order_item();

-- Restrict non-admin modifications
create or replace function public.restrict_customer_order_update()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status <> 'cancelled' or old.status not in ('pending', 'confirmed') then
      raise exception 'You can only cancel an order while it is pending or confirmed';
    end if;
  end if;

  if new.subtotal is distinct from old.subtotal
     or new.shipping_amount is distinct from old.shipping_amount
     or new.discount_amount is distinct from old.discount_amount
     or new.tax_amount is distinct from old.tax_amount
     or new.total_amount is distinct from old.total_amount
     or new.shipping_address is distinct from old.shipping_address
     or new.user_id is distinct from old.user_id
     or new.order_number is distinct from old.order_number
  then
    raise exception 'You are not allowed to modify this field on an order';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_restrict_customer_order_update on public.orders;
create trigger trg_restrict_customer_order_update
  before update on public.orders
  for each row
  execute function public.restrict_customer_order_update();

-- ----------------------------------------------------------------------------
-- 5.5 Checkout RPC: create_order()
-- ----------------------------------------------------------------------------
create or replace function public.create_order(
  p_address_id bigint,
  p_customer_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id uuid;
  v_address record;
  v_order public.orders;
  v_subtotal numeric(12,2) := 0;
  v_item record;
begin
  select id into v_cart_id from public.carts where user_id = auth.uid();
  if v_cart_id is null then
    raise exception 'No cart found for current user';
  end if;

  if not exists (select 1 from public.cart_items where cart_id = v_cart_id) then
    raise exception 'Cart is empty';
  end if;

  select * into v_address from public.addresses
  where id = p_address_id and user_id = auth.uid();
  if v_address is null then
    raise exception 'Address not found';
  end if;

  if exists (
    select 1 from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart_id
      and (pv.is_active = false or p.status <> 'active')
  ) then
    raise exception 'One or more items in your cart are no longer available';
  end if;

  select coalesce(sum(pv.price * ci.quantity), 0) into v_subtotal
  from public.cart_items ci
  join public.product_variants pv on pv.id = ci.variant_id
  where ci.cart_id = v_cart_id;

  insert into public.orders (
    user_id, status,
    subtotal, shipping_amount, discount_amount, tax_amount, total_amount,
    shipping_address, customer_note
  ) values (
    auth.uid(), 'pending',
    v_subtotal, 0, 0, 0, v_subtotal,
    jsonb_build_object(
      'full_name', v_address.full_name,
      'phone', v_address.phone,
      'address_line1', v_address.address_line1,
      'address_line2', v_address.address_line2,
      'landmark', v_address.landmark,
      'city', v_address.city,
      'state', v_address.state,
      'postal_code', v_address.postal_code,
      'country', v_address.country
    ),
    p_customer_note
  )
  returning * into v_order;

  for v_item in
    select ci.variant_id, ci.quantity, pv.price, pv.compare_at_price,
           p.name as product_name, pv.sku
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart_id
    order by ci.variant_id
  loop
    insert into public.order_items (
      order_id, variant_id, product_name, sku,
      unit_price, compare_at_price, quantity, subtotal
    ) values (
      v_order.id, v_item.variant_id, v_item.product_name, v_item.sku,
      v_item.price, v_item.compare_at_price, v_item.quantity,
      v_item.price * v_item.quantity
    );
  end loop;

  return v_order;
end;
$$;

revoke execute on function public.create_order(bigint, text) from public;
grant execute on function public.create_order(bigint, text) to authenticated;

-- ----------------------------------------------------------------------------
-- 5.6 Orders RLS
-- ----------------------------------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- orders
create policy "orders_select_own" on public.orders
  for select using (user_id = (select auth.uid()));

create policy "orders_select_admin" on public.orders
  for select using ((select public.is_admin()));

create policy "orders_insert_admin" on public.orders
  for insert with check ((select public.is_admin()));

create policy "orders_update_own_or_admin" on public.orders
  for update
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- order_items
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );

create policy "order_items_all_admin" on public.order_items
  for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- order_status_history
create policy "order_status_history_select_own" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id and o.user_id = (select auth.uid())
    )
  );

create policy "order_status_history_select_admin" on public.order_status_history
  for select using ((select public.is_admin()));


-- ============================================================================
-- SECTION 6: AUTH LIFECYCLE PROVISIONS
-- ============================================================================

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
