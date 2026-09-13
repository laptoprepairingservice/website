-- ============================================================================
-- SUPABASE PRODUCTION DATABASE SETUP - PHASE 9
-- Blog Architecture (Categories, Tags, Posts, Products, Relations)
-- ============================================================================

-- 1. Create public.profiles if not exists & sync from auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  avatar_url text,
  role text default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (id, first_name, last_name, email, role)
select 
  id,
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  email,
  coalesce(raw_app_meta_data->>'role', 'admin')
from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    coalesce(new.raw_app_meta_data->>'role', 'admin')
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert or update on auth.users
  for each row execute function public.handle_new_user_profile();

-- 2. Create blog_categories
create table if not exists public.blog_categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create blog_tags
create table if not exists public.blog_tags (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 4. Create blog_posts
create table if not exists public.blog_posts (
  id bigint generated always as identity primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  featured_image_url text,
  featured_image_alt text,
  meta_title text,
  meta_description text,
  canonical_url text,
  reading_time_minutes integer,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- 5. Junction table: blog_post_categories (multiple categories per post)
create table if not exists public.blog_post_categories (
  post_id bigint not null references public.blog_posts(id) on delete cascade,
  category_id bigint not null references public.blog_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, category_id)
);

-- 6. Junction table: blog_post_tags (multiple tags per post)
create table if not exists public.blog_post_tags (
  post_id bigint not null references public.blog_posts(id) on delete cascade,
  tag_id bigint not null references public.blog_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

-- 7. Junction table: blog_post_products (products referenced in blog post)
create table if not exists public.blog_post_products (
  post_id bigint not null references public.blog_posts(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  primary key (post_id, product_id)
);

-- 8. Junction table: blog_post_related_posts (related blog posts)
create table if not exists public.blog_post_related_posts (
  post_id bigint not null references public.blog_posts(id) on delete cascade,
  related_post_id bigint not null references public.blog_posts(id) on delete cascade,
  sort_order integer default 0,
  created_at timestamptz not null default now(),
  primary key (post_id, related_post_id),
  check (post_id <> related_post_id)
);

-- Auto-updater triggers
drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists set_blog_categories_updated_at on public.blog_categories;
create trigger set_blog_categories_updated_at
  before update on public.blog_categories
  for each row execute function public.set_updated_at();

-- Indexes for performance
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_blog_posts_author_id on public.blog_posts(author_id);
create index if not exists idx_blog_posts_published_at on public.blog_posts(published_at desc nulls last);
create index if not exists idx_blog_post_categories_post on public.blog_post_categories(post_id);
create index if not exists idx_blog_post_categories_category on public.blog_post_categories(category_id);
create index if not exists idx_blog_post_tags_post on public.blog_post_tags(post_id);
create index if not exists idx_blog_post_tags_tag on public.blog_post_tags(tag_id);
create index if not exists idx_blog_post_products_post on public.blog_post_products(post_id);
create index if not exists idx_blog_post_products_product on public.blog_post_products(product_id);
create index if not exists idx_blog_post_related_post on public.blog_post_related_posts(post_id);

-- Storage bucket for blogs
insert into storage.buckets (id, name, public)
values ('blogs', 'blogs', true)
on conflict (id) do update set public = true;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_categories enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_post_products enable row level security;
alter table public.blog_post_related_posts enable row level security;

-- Drop existing policies if any
drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;
drop policy if exists "blog_categories_select" on public.blog_categories;
drop policy if exists "blog_categories_admin_all" on public.blog_categories;
drop policy if exists "blog_tags_select" on public.blog_tags;
drop policy if exists "blog_tags_admin_all" on public.blog_tags;
drop policy if exists "blog_posts_select" on public.blog_posts;
drop policy if exists "blog_posts_admin_all" on public.blog_posts;
drop policy if exists "blog_post_categories_select" on public.blog_post_categories;
drop policy if exists "blog_post_categories_admin_all" on public.blog_post_categories;
drop policy if exists "blog_post_tags_select" on public.blog_post_tags;
drop policy if exists "blog_post_tags_admin_all" on public.blog_post_tags;
drop policy if exists "blog_post_products_select" on public.blog_post_products;
drop policy if exists "blog_post_products_admin_all" on public.blog_post_products;
drop policy if exists "blog_post_related_posts_select" on public.blog_post_related_posts;
drop policy if exists "blog_post_related_posts_admin_all" on public.blog_post_related_posts;

-- RLS Policies
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_categories_select" on public.blog_categories for select using (true);
create policy "blog_categories_admin_all" on public.blog_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_tags_select" on public.blog_tags for select using (true);
create policy "blog_tags_admin_all" on public.blog_tags for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_posts_select" on public.blog_posts for select using (
  status = 'published' and (deleted_at is null) or public.is_admin()
);
create policy "blog_posts_admin_all" on public.blog_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_post_categories_select" on public.blog_post_categories for select using (true);
create policy "blog_post_categories_admin_all" on public.blog_post_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_post_tags_select" on public.blog_post_tags for select using (true);
create policy "blog_post_tags_admin_all" on public.blog_post_tags for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_post_products_select" on public.blog_post_products for select using (true);
create policy "blog_post_products_admin_all" on public.blog_post_products for all using (public.is_admin()) with check (public.is_admin());

create policy "blog_post_related_posts_select" on public.blog_post_related_posts for select using (true);
create policy "blog_post_related_posts_admin_all" on public.blog_post_related_posts for all using (public.is_admin()) with check (public.is_admin());

-- Storage policies for blogs bucket
create policy "Blogs bucket select"
on storage.objects for select
to public
using (bucket_id = 'blogs');

create policy "Blogs bucket insert"
on storage.objects for insert
to public
with check (bucket_id = 'blogs');

create policy "Blogs bucket update"
on storage.objects for update
to public
using (bucket_id = 'blogs');

create policy "Blogs bucket delete"
on storage.objects for delete
to public
using (bucket_id = 'blogs');
