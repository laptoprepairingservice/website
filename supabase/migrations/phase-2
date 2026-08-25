-- ============================================================================
-- PHASE 2: CATALOG
-- categories, brands, products, product_variants, product_images
--
-- Beyond the basic sketch, this migration adds:
--   - categories/brands: image/logo path, sort_order, SEO meta fields
--   - products: draft/active/archived workflow (not just on/off), is_oem
--     flag (genuine vs compatible/aftermarket — common in the parts market),
--     full-text search via a generated tsvector column + GIN index
--   - product_variants: barcode, human-readable variant_name + a jsonb
--     `options` field for fast frontend selectors (e.g. {"capacity":"16GB"})
--     separate from the detailed spec system (attributes, added in a later
--     phase), condition (new/refurbished/used — relevant for parts resale),
--     and physical dimensions for shipping-rate calculation
--   - product_images: optional variant_id (for variant-specific photos),
--     width/height (avoids layout shift on the frontend before load)
--   - Triggers that auto-unset the previous "default variant" / "primary
--     image" when a new one is marked, backed by a partial unique index as
--     a safety net — so the app never has to do that bookkeeping itself
--   - RLS split into "public can browse published items" vs "admin can
--     manage everything", which is the real access pattern for a storefront
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id bigint generated always as identity primary key,

  parent_id bigint references public.categories(id) on delete set null,

  name text not null,
  slug text not null unique,
  description text,

  image_path text,          -- Supabase Storage path for category icon/banner
  sort_order integer not null default 0,
  is_active boolean not null default true,

  meta_title text,
  meta_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  check (id is distinct from parent_id)
);

comment on column public.categories.image_path is 'Path in Supabase Storage, e.g. categories/ram.webp';

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row
  execute function public.set_updated_at();

create index if not exists idx_categories_parent_id on public.categories(parent_id);
create index if not exists idx_categories_active on public.categories(is_active);

-- ----------------------------------------------------------------------------
-- 2. brands
-- ----------------------------------------------------------------------------
create table if not exists public.brands (
  id bigint generated always as identity primary key,

  name text not null unique,
  slug text not null unique,

  logo_path text,            -- Supabase Storage path
  website_url text,
  description text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at
  before update on public.brands
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. products
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id bigint generated always as identity primary key,

  category_id bigint not null references public.categories(id),
  brand_id bigint references public.brands(id),

  name text not null,
  slug text not null unique,

  short_description text,    -- for listing/cards
  description text,          -- full detail page copy

  sku text unique,

  is_oem boolean not null default true,
  -- true  = genuine manufacturer part
  -- false = compatible / aftermarket replacement part
  -- (a real distinction in the laptop-parts resale market)

  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  -- draft    = being set up, never shown to customers
  -- active   = published, visible in storefront
  -- archived = discontinued, kept for order history but hidden

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

comment on column public.products.status is 'draft = hidden, active = published, archived = discontinued but kept for order history';
comment on column public.products.is_oem is 'true = genuine manufacturer part, false = compatible/aftermarket';

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_brand_id on public.products(brand_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_search_vector on public.products using gin(search_vector);

-- ----------------------------------------------------------------------------
-- 4. product_variants
-- ----------------------------------------------------------------------------
create table if not exists public.product_variants (
  id bigint generated always as identity primary key,

  product_id bigint not null references public.products(id) on delete cascade,
  -- NOTE: cascade removes variants when a product row is deleted. In
  -- practice, prefer setting products.status = 'archived' over hard-deleting
  -- a product that has ever been ordered — order_items keeps its own
  -- snapshot, but a deleted variant_id will null out that FK link (see
  -- Phase 5). Hard-delete is really only for products created by mistake.

  sku text not null unique,
  barcode text,

  variant_name text,          -- human-readable label, e.g. "16GB DDR4 3200MHz"
  options jsonb not null default '{}'::jsonb,
  -- machine-readable selector data, e.g. {"capacity": "16GB", "speed": "3200MHz"}
  -- Distinct from `attributes` (added later): this is for fast variant
  -- pickers on the product page; `attributes` holds the full spec sheet.

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
  -- physical dimensions drive shipping-rate calculation later; parts range
  -- from a tiny SO-DIMM stick to a full display panel, so this matters here
  -- more than in a typical single-category store

  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_product_variants_updated_at on public.product_variants;
create trigger set_product_variants_updated_at
  before update on public.product_variants
  for each row
  execute function public.set_updated_at();

create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create index if not exists idx_product_variants_active on public.product_variants(is_active);

-- Auto-unset the previous default variant when a new one is marked default
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

-- Safety net in case two rows are marked default concurrently
create unique index if not exists uq_product_variants_default_per_product
  on public.product_variants(product_id)
  where is_default = true;

-- ----------------------------------------------------------------------------
-- 5. product_images
-- ----------------------------------------------------------------------------
create table if not exists public.product_images (
  id bigint generated always as identity primary key,

  product_id bigint not null references public.products(id) on delete cascade,
  variant_id bigint references public.product_variants(id) on delete set null,
  -- nullable: most images belong to the product generally, but this lets you
  -- attach variant-specific photos (e.g. a color-specific keyboard shot)

  storage_path text not null,   -- Supabase Storage path
  alt_text text,

  width integer,
  height integer,               -- dimensions in px, avoids frontend layout shift

  sort_order integer not null default 0,
  is_primary boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_product_images_updated_at on public.product_images;
create trigger set_product_images_updated_at
  before update on public.product_images
  for each row
  execute function public.set_updated_at();

create index if not exists idx_product_images_product_id on public.product_images(product_id);
create index if not exists idx_product_images_variant_id on public.product_images(variant_id);

-- Auto-unset the previous primary image when a new one is marked primary
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

-- ============================================================================
-- 6. Row Level Security
--    Pattern for every catalog table: anyone (including anon/guest) can
--    read published items; only admins can write.
-- ============================================================================
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

-- categories: public reads active ones, admin manages all
create policy "categories_select_public"
  on public.categories for select
  using (is_active = true);

create policy "categories_all_admin"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- brands
create policy "brands_select_public"
  on public.brands for select
  using (is_active = true);

create policy "brands_all_admin"
  on public.brands for all
  using (public.is_admin())
  with check (public.is_admin());

-- products: public only sees 'active' status
create policy "products_select_public"
  on public.products for select
  using (status = 'active');

create policy "products_all_admin"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- product_variants: public sees active variants of active products
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
  using (public.is_admin())
  with check (public.is_admin());

-- product_images: public sees images of active products
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
  using (public.is_admin())
  with check (public.is_admin());