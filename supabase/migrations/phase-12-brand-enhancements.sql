-- Phase 12: Brand Enhancements (sort_order column)
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_brands_sort_order ON public.brands(sort_order);
