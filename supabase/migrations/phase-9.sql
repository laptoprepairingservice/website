-- ============================================================================
-- PHASE 9: Public UUIDs for URL-safe dynamic routes
--
-- Adds `public_id` (uuid, auto-generated) to catalog and account tables so
-- the app can use stable, non-sequential identifiers in URLs instead of
-- exposing internal bigint primary keys.
--
-- Internal bigint `id` columns are unchanged and remain the FK target for
-- joins. `public_id` is only for external references (routes, APIs, links).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. products
-- ----------------------------------------------------------------------------
alter table public.products
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists uq_products_public_id
  on public.products (public_id);

comment on column public.products.public_id is
  'URL-safe identifier for storefront and admin routes (e.g. /products/{public_id}/edit)';

-- ----------------------------------------------------------------------------
-- 2. product_variants
-- ----------------------------------------------------------------------------
alter table public.product_variants
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists uq_product_variants_public_id
  on public.product_variants (public_id);

comment on column public.product_variants.public_id is
  'URL-safe identifier for variant-specific admin or API routes';

-- ----------------------------------------------------------------------------
-- 3. categories
-- ----------------------------------------------------------------------------
alter table public.categories
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists uq_categories_public_id
  on public.categories (public_id);

comment on column public.categories.public_id is
  'URL-safe identifier for category admin routes and APIs';

-- ----------------------------------------------------------------------------
-- 4. brands
-- ----------------------------------------------------------------------------
alter table public.brands
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists uq_brands_public_id
  on public.brands (public_id);

comment on column public.brands.public_id is
  'URL-safe identifier for brand admin routes and APIs';

-- ----------------------------------------------------------------------------
-- 5. orders
-- ----------------------------------------------------------------------------
alter table public.orders
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists uq_orders_public_id
  on public.orders (public_id);

comment on column public.orders.public_id is
  'URL-safe identifier for account order detail routes (e.g. /account/orders/{public_id})';

-- ----------------------------------------------------------------------------
-- 6. addresses
-- ----------------------------------------------------------------------------
alter table public.addresses
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists uq_addresses_public_id
  on public.addresses (public_id);

comment on column public.addresses.public_id is
  'URL-safe identifier for address edit routes in the customer account';
