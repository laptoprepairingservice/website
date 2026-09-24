-- ============================================================================
-- PHASE 14: PRODUCT SCHEMA.ORG JSON-LD STRUCTURED DATA
-- ============================================================================
-- Adds schema_org_jsonld column to public.products to allow custom Schema.org
-- structured data overrides for enhanced search engine rich snippets.
-- ============================================================================

alter table public.products
  add column if not exists schema_org_jsonld jsonb;

comment on column public.products.schema_org_jsonld is
  'Custom Schema.org JSON-LD structured data payload for the product detail page';

notify pgrst, 'reload schema';
