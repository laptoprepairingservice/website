-- ============================================================================
-- Phase 11: Product Enhancements (Bestseller, Specifications, Compatibility)
-- ============================================================================

alter table public.products
  add column if not exists is_bestseller boolean not null default false,
  add column if not exists specifications text,
  add column if not exists compatibility text;

comment on column public.products.is_bestseller is 'Manually marks a product as a bestseller in listings and badges';
comment on column public.products.specifications is 'Rich HTML specification table authored via TipTap';
comment on column public.products.compatibility is 'Compatible laptop/device models and part numbers (if applicable)';

create index if not exists idx_products_is_bestseller on public.products(is_bestseller);
