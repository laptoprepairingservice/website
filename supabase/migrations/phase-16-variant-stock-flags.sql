-- ============================================================================
-- Phase 16: Variant Stock Flags (Force Out of Stock)
-- ============================================================================

alter table public.product_variants
  add column if not exists is_out_of_stock boolean not null default false;

comment on column public.product_variants.is_out_of_stock is 'When true, forces variant to appear out of stock on storefront regardless of inventory level';

create index if not exists idx_product_variants_is_out_of_stock on public.product_variants(is_out_of_stock);
