-- ============================================================================
-- PHASE 10: PRODUCT ASSETS (Banner Image, Gallery Images, Videos) & STORAGE
--
-- Extends public.product_images to support:
--   - public_id (uuid) for safe external reference in admin API/routes
--   - media_type ('image', 'video') for gallery media support
--   - is_banner flag with automated single-banner enforcement trigger
--   - file metadata: file_name, file_size, mime_type
--   - Supabase Storage bucket 'products' with RLS policies for images & videos
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extend product_images table
-- ----------------------------------------------------------------------------
alter table public.product_images
  add column if not exists public_id uuid not null default gen_random_uuid(),
  add column if not exists media_type text not null default 'image'
    check (media_type in ('image', 'video')),
  add column if not exists is_banner boolean not null default false,
  add column if not exists file_name text,
  add column if not exists file_size bigint check (file_size is null or file_size >= 0),
  add column if not exists mime_type text;

-- Unique public identifier for routes and external references
create unique index if not exists uq_product_images_public_id
  on public.product_images (public_id);

comment on column public.product_images.public_id is
  'URL-safe identifier for product image/video asset operations';
comment on column public.product_images.media_type is
  'Type of asset: image or video';
comment on column public.product_images.is_banner is
  'Flag indicating whether this image serves as the primary banner image for the product';

-- ----------------------------------------------------------------------------
-- 2. Banner Image Trigger & Constraint
-- Auto-unset previous banner when a new asset is marked as banner
-- ----------------------------------------------------------------------------
-- Clean up legacy primary image trigger & function (fails if is_primary was dropped)
drop trigger if exists trg_single_primary_image on public.product_images;
drop function if exists public.enforce_single_primary_image() cascade;
drop index if exists public.uq_product_images_primary_per_product;

create or replace function public.enforce_single_banner_image()
returns trigger
language plpgsql
as $$
begin
  if new.is_banner then
    update public.product_images
    set is_banner = false
    where product_id = new.product_id
      and id <> coalesce(new.id, -1)
      and is_banner = true;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_single_banner_image on public.product_images;
create trigger trg_single_banner_image
  before insert or update of is_banner on public.product_images
  for each row
  when (new.is_banner = true)
  execute function public.enforce_single_banner_image();

-- Safety net partial unique index: at most one banner per product
create unique index if not exists uq_product_images_banner_per_product
  on public.product_images (product_id)
  where is_banner = true;

-- Additional index for quick gallery queries ordered by sort_order
create index if not exists idx_product_images_product_order
  on public.product_images (product_id, sort_order asc, created_at asc);

-- ----------------------------------------------------------------------------
-- 3. Supabase Storage Bucket Setup
-- ----------------------------------------------------------------------------
-- Ensure 'products' bucket exists and is public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  52428800, -- 50 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg'
  ]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/ogg'
  ];

-- ----------------------------------------------------------------------------
-- 4. Storage Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
-- Allow anyone (public/guest) to read objects in 'products' bucket
drop policy if exists "products_storage_select_public" on storage.objects;
create policy "products_storage_select_public"
  on storage.objects for select
  using (bucket_id = 'products');

-- Allow admins to upload objects into 'products' bucket
drop policy if exists "products_storage_insert_admin" on storage.objects;
create policy "products_storage_insert_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and (select public.is_admin())
  );

-- Allow admins to update objects in 'products' bucket
drop policy if exists "products_storage_update_admin" on storage.objects;
create policy "products_storage_update_admin"
  on storage.objects for update
  using (
    bucket_id = 'products'
    and (select public.is_admin())
  )
  with check (
    bucket_id = 'products'
    and (select public.is_admin())
  );

-- Allow admins to delete objects from 'products' bucket
drop policy if exists "products_storage_delete_admin" on storage.objects;
create policy "products_storage_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and (select public.is_admin())
  );
