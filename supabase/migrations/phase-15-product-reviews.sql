-- ============================================================================
-- PHASE 15: PRODUCT REVIEWS MODULE
-- ============================================================================

create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  product_id bigint not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,

  reviewer_name text not null,
  reviewer_email text,

  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text not null,

  is_verified_purchase boolean not null default true,
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_reviews is 'Product customer ratings and reviews';
comment on column public.product_reviews.public_id is 'URL-safe identifier for review APIs and routes';

-- Trigger for updated_at
drop trigger if exists set_product_reviews_updated_at on public.product_reviews;
create trigger set_product_reviews_updated_at
  before update on public.product_reviews
  for each row
  execute function public.set_updated_at();

-- Indexes for query performance
create index if not exists idx_product_reviews_product_id on public.product_reviews(product_id);
create index if not exists idx_product_reviews_user_id on public.product_reviews(user_id);
create index if not exists idx_product_reviews_status on public.product_reviews(status);
create index if not exists idx_product_reviews_rating on public.product_reviews(rating);
create index if not exists idx_product_reviews_created_at on public.product_reviews(created_at desc);

-- Row Level Security
alter table public.product_reviews enable row level security;

create policy "Public can view approved product reviews"
  on public.product_reviews for select
  using (status = 'approved');

create policy "Admins have full access to product reviews"
  on public.product_reviews for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Authenticated users can submit review"
  on public.product_reviews for insert
  with check (auth.uid() is not null and (user_id is null or user_id = auth.uid()));
