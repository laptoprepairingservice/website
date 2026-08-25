-- ============================================================================
-- PHASE 6: FOLLOW-UPS
--   1. Cart empties when an order is confirmed (not locked, not cleared at
--      create_order time — the cart stays until payment/acceptance succeeds)
--   2. handle_new_user() moves onto public.profiles; auth.users only inserts
--      the profile (now including phone from user_metadata)
--   3. Storefront / order-history indexes
--   4. RLS helpers wrapped in (select …) so they init once per statement
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Signup: auth.users → profile, profiles → cart + wishlist
--    handle_new_user() now fires ON profiles, so any profile row (signup,
--    admin insert, backfill) gets a cart and a default wishlist. Phone is
--    copied from raw_user_meta_data at profile-create time.
-- ----------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.create_profile_for_auth_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.carts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.wishlists (user_id, name, is_default)
  select new.id, 'My Wishlist', true
  where not exists (
    select 1 from public.wishlists w where w.user_id = new.id
  );

  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;

create trigger on_profile_created
  after insert on public.profiles
  for each row
  execute function public.handle_new_user();

-- Backfill phone for profiles created before this migration.
update public.profiles p
set phone = u.raw_user_meta_data ->> 'phone'
from auth.users u
where u.id = p.id
  and p.phone is null
  and coalesce(u.raw_user_meta_data ->> 'phone', '') <> '';

-- ----------------------------------------------------------------------------
-- 2. Empty the cart when the order is confirmed.
--    create_order() snapshots line items onto the order and leaves the cart
--    intact so a failed payment still has items to retry. Confirmation is
--    the signal that the order stuck — then the cart is cleared. No cart
--    row lock: the cart row stays reusable across sessions (Phase 4).
-- ----------------------------------------------------------------------------

create or replace function public.handle_order_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_item record;
begin
  if new.status is distinct from old.status then

    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    if new.status = 'confirmed' and old.status = 'pending' then
      delete from public.cart_items
      where cart_id = (
        select id from public.carts where user_id = new.user_id
      );
    end if;

    if new.status = 'shipped' and old.status not in ('shipped', 'delivered') then
      for v_item in
        select variant_id, quantity from public.order_items where order_id = new.id
      loop
        insert into public.inventory_movements
          (variant_id, quantity_change, movement_type, reference_type, reference_id, note)
        values
          (v_item.variant_id, -v_item.quantity, 'sale', 'order', new.id,
           'Order ' || new.order_number || ' shipped');

        update public.inventory
        set reserved_quantity = reserved_quantity - v_item.quantity
        where variant_id = v_item.variant_id;
      end loop;
    end if;

    if new.status = 'cancelled' and old.status in ('pending', 'confirmed', 'processing') then
      for v_item in
        select variant_id, quantity from public.order_items where order_id = new.id
      loop
        update public.inventory
        set reserved_quantity = reserved_quantity - v_item.quantity
        where variant_id = v_item.variant_id;
      end loop;

      new.cancelled_at := coalesce(new.cancelled_at, now());
    end if;

  end if;

  return new;
end;
$$;

create or replace function public.create_order(
  p_address_id bigint,
  p_customer_note text default null
)
returns public.orders
language plpgsql
security definer set search_path = public
as $$
declare
  v_cart_id uuid;
  v_address record;
  v_order public.orders;
  v_subtotal numeric(12,2) := 0;
  v_item record;
begin
  select id into v_cart_id from public.carts where user_id = auth.uid();
  if v_cart_id is null then
    raise exception 'No cart found for current user';
  end if;

  if not exists (select 1 from public.cart_items where cart_id = v_cart_id) then
    raise exception 'Cart is empty';
  end if;

  select * into v_address from public.addresses
  where id = p_address_id and user_id = auth.uid();
  if v_address is null then
    raise exception 'Address not found';
  end if;

  if exists (
    select 1 from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart_id
      and (pv.is_active = false or p.status <> 'active')
  ) then
    raise exception 'One or more items in your cart are no longer available';
  end if;

  select coalesce(sum(pv.price * ci.quantity), 0) into v_subtotal
  from public.cart_items ci
  join public.product_variants pv on pv.id = ci.variant_id
  where ci.cart_id = v_cart_id;

  insert into public.orders (
    user_id, status,
    subtotal, shipping_amount, discount_amount, tax_amount, total_amount,
    shipping_address, customer_note
  ) values (
    auth.uid(), 'pending',
    v_subtotal, 0, 0, 0, v_subtotal,
    jsonb_build_object(
      'full_name', v_address.full_name,
      'phone', v_address.phone,
      'address_line1', v_address.address_line1,
      'address_line2', v_address.address_line2,
      'landmark', v_address.landmark,
      'city', v_address.city,
      'state', v_address.state,
      'postal_code', v_address.postal_code,
      'country', v_address.country
    ),
    p_customer_note
  )
  returning * into v_order;

  for v_item in
    select ci.variant_id, ci.quantity, pv.price, pv.compare_at_price,
           p.name as product_name, pv.sku
    from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart_id
    order by ci.variant_id
  loop
    insert into public.order_items (
      order_id, variant_id, product_name, sku,
      unit_price, compare_at_price, quantity, subtotal
    ) values (
      v_order.id, v_item.variant_id, v_item.product_name, v_item.sku,
      v_item.price, v_item.compare_at_price, v_item.quantity,
      v_item.price * v_item.quantity
    );
  end loop;

  -- Cart is left in place until status becomes 'confirmed'.
  return v_order;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Indexes
-- ----------------------------------------------------------------------------

create index if not exists idx_products_status_category
  on public.products (status, category_id);

create index if not exists idx_product_variants_product_active
  on public.product_variants (product_id, is_active);

create index if not exists idx_orders_user_created
  on public.orders (user_id, created_at desc);

create index if not exists idx_carts_updated_at
  on public.carts (updated_at);

-- ----------------------------------------------------------------------------
-- 4. RLS: wrap auth.uid() / is_admin() in (select …)
--    Postgres can then init the value once per statement instead of per row.
-- ----------------------------------------------------------------------------

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;

create policy "profiles_select_own" on public.profiles for
select
  using ((select auth.uid()) = id);

create policy "profiles_select_admin" on public.profiles for
select
  using ((select public.is_admin()));

create policy "profiles_update_own" on public.profiles
for update
  using ((select auth.uid()) = id)
with
  check (
    (select auth.uid()) = id
    and role = (
      select
        role
      from
        public.profiles
      where
        id = (select auth.uid())
    )
  );

create policy "profiles_update_admin" on public.profiles
for update
  using ((select public.is_admin()))
with
  check ((select public.is_admin()));

-- catalog
drop policy if exists "categories_all_admin" on public.categories;
drop policy if exists "brands_all_admin" on public.brands;
drop policy if exists "products_all_admin" on public.products;
drop policy if exists "product_variants_all_admin" on public.product_variants;
drop policy if exists "product_images_all_admin" on public.product_images;

create policy "categories_all_admin"
  on public.categories for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "brands_all_admin"
  on public.brands for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "products_all_admin"
  on public.products for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "product_variants_all_admin"
  on public.product_variants for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "product_images_all_admin"
  on public.product_images for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- inventory
drop policy if exists "inventory_select_admin" on public.inventory;
drop policy if exists "inventory_update_admin" on public.inventory;
drop policy if exists "inventory_movements_select_admin" on public.inventory_movements;
drop policy if exists "inventory_movements_insert_admin" on public.inventory_movements;

create policy "inventory_select_admin"
  on public.inventory for select
  using ((select public.is_admin()));

create policy "inventory_update_admin"
  on public.inventory for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "inventory_movements_select_admin"
  on public.inventory_movements for select
  using ((select public.is_admin()));

create policy "inventory_movements_insert_admin"
  on public.inventory_movements for insert
  with check ((select public.is_admin()));

-- addresses
drop policy if exists "addresses_select_own" on public.addresses;
drop policy if exists "addresses_select_admin" on public.addresses;
drop policy if exists "addresses_insert_own" on public.addresses;
drop policy if exists "addresses_update_own" on public.addresses;
drop policy if exists "addresses_delete_own" on public.addresses;

create policy "addresses_select_own" on public.addresses
  for select using (user_id = (select auth.uid()));
create policy "addresses_select_admin" on public.addresses
  for select using ((select public.is_admin()));
create policy "addresses_insert_own" on public.addresses
  for insert with check (user_id = (select auth.uid()));
create policy "addresses_update_own" on public.addresses
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "addresses_delete_own" on public.addresses
  for delete using (user_id = (select auth.uid()));

-- carts
drop policy if exists "carts_select_own" on public.carts;
drop policy if exists "carts_select_admin" on public.carts;
drop policy if exists "carts_update_own" on public.carts;

create policy "carts_select_own" on public.carts
  for select using (user_id = (select auth.uid()));
create policy "carts_select_admin" on public.carts
  for select using ((select public.is_admin()));
create policy "carts_update_own" on public.carts
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- cart_items
drop policy if exists "cart_items_select_own" on public.cart_items;
drop policy if exists "cart_items_select_admin" on public.cart_items;
drop policy if exists "cart_items_insert_own" on public.cart_items;
drop policy if exists "cart_items_update_own" on public.cart_items;
drop policy if exists "cart_items_delete_own" on public.cart_items;

create policy "cart_items_select_own" on public.cart_items
  for select using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );
create policy "cart_items_select_admin" on public.cart_items
  for select using ((select public.is_admin()));
create policy "cart_items_insert_own" on public.cart_items
  for insert with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );
create policy "cart_items_update_own" on public.cart_items
  for update using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );
create policy "cart_items_delete_own" on public.cart_items
  for delete using (
    exists (
      select 1 from public.carts c
      where c.id = cart_items.cart_id and c.user_id = (select auth.uid())
    )
  );

-- wishlists
drop policy if exists "wishlists_select_own" on public.wishlists;
drop policy if exists "wishlists_select_admin" on public.wishlists;
drop policy if exists "wishlists_insert_own" on public.wishlists;
drop policy if exists "wishlists_update_own" on public.wishlists;
drop policy if exists "wishlists_delete_own" on public.wishlists;

create policy "wishlists_select_own" on public.wishlists
  for select using (user_id = (select auth.uid()));
create policy "wishlists_select_admin" on public.wishlists
  for select using ((select public.is_admin()));
create policy "wishlists_insert_own" on public.wishlists
  for insert with check (user_id = (select auth.uid()));
create policy "wishlists_update_own" on public.wishlists
  for update using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "wishlists_delete_own" on public.wishlists
  for delete using (user_id = (select auth.uid()));

-- wishlist_items
drop policy if exists "wishlist_items_select_own" on public.wishlist_items;
drop policy if exists "wishlist_items_insert_own" on public.wishlist_items;
drop policy if exists "wishlist_items_update_own" on public.wishlist_items;
drop policy if exists "wishlist_items_delete_own" on public.wishlist_items;

create policy "wishlist_items_select_own" on public.wishlist_items
  for select using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );
create policy "wishlist_items_insert_own" on public.wishlist_items
  for insert with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );
create policy "wishlist_items_update_own" on public.wishlist_items
  for update using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );
create policy "wishlist_items_delete_own" on public.wishlist_items
  for delete using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_items.wishlist_id and w.user_id = (select auth.uid())
    )
  );

-- orders
drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_select_admin" on public.orders;
drop policy if exists "orders_insert_admin" on public.orders;
drop policy if exists "orders_update_own_or_admin" on public.orders;

create policy "orders_select_own" on public.orders
  for select using (user_id = (select auth.uid()));
create policy "orders_select_admin" on public.orders
  for select using ((select public.is_admin()));
create policy "orders_insert_admin" on public.orders
  for insert with check ((select public.is_admin()));
create policy "orders_update_own_or_admin" on public.orders
  for update
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "order_items_select_own" on public.order_items;
drop policy if exists "order_items_all_admin" on public.order_items;

create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );
create policy "order_items_all_admin" on public.order_items
  for all using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "order_status_history_select_own" on public.order_status_history;
drop policy if exists "order_status_history_select_admin" on public.order_status_history;

create policy "order_status_history_select_own" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id and o.user_id = (select auth.uid())
    )
  );
create policy "order_status_history_select_admin" on public.order_status_history
  for select using ((select public.is_admin()));
