-- Phase 17: Brand SEO Enhancements (meta_title, meta_description)
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;
