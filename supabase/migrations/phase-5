-- ============================================================================
-- PHASE 5: ORDERS
-- orders, order_items, order_status_history
--
-- Forward-compatibility note: you mentioned a real third-party shipping
-- integration is coming (shipments, shipment_events, shipping_providers,
-- shipping_provider_configs, shipping_rates, shipping_serviceability_cache).
-- That shaped a few decisions here:
--   - orders has NO carrier/tracking_number column -- that belongs entirely
--     to the future `shipments` table, and one order may end up with
--     multiple shipments (partial fulfillment), so it shouldn't be
--     1:1 baked into orders anyway.
--   - order_status_history (originally sketched alongside shipments) is
--     built now instead -- it's really an ORDER lifecycle audit trail
--     (pending/confirmed/processing/shipped/delivered/cancelled/refunded),
--     distinct from the future shipment_events table, which will hold raw
--     carrier tracking webhooks (picked up / in transit / out for delivery).
--     Keeping these separate avoids conflating "our order state" with
--     "what the courier's API told us."
--   - order_items is intentionally just a priced, quantity'd line -- a
--     future shipment_items table can reference it to say "3 of these 5
--     units went out in shipment #2" without any change needed here.
--
-- The other big idea in this phase: orders are never created with raw
-- INSERTs from the client. create_order() (bottom of this file) does it
-- atomically -- computing totals server-side, snapshotting prices, and
-- reserving stock per line item, all in one transaction. If any item is
-- out of stock, the whole order fails to create. See the RLS section for
-- why there's deliberately no client-side INSERT policy on `orders`.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Order number generator
--    A column default, not something the app has to remember to generate --
--    works for the RPC below AND for any direct admin insert.
-- ----------------------------------------------------------------------------
create sequence if not exists public.order_number_seq;

create or replace function public.generate_order_number()
returns text
language sql
as $$
  select 'ORD-' || to_char(now(), 'YYYYMMDD') || '-'
    || lpad(nextval('public.order_number_seq')::text, 6, '0');
$$;

-- ----------------------------------------------------------------------------
-- 2. orders
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id bigint generated always as identity primary key,

  user_id uuid not null references public.profiles(id),
  -- NOT NULL: per Phase 4, even guest checkout uses Supabase Anonymous
  -- Sign-ins, so there is always a real auth.uid() by the time an order exists.

  order_number text not null unique default public.generate_order_number(),

  status text not null default 'pending' check (
    status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),

  subtotal numeric(12,2) not null check (subtotal >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),

  check (total_amount = subtotal + shipping_amount + tax_amount - discount_amount),

  shipping_address jsonb not null,
  -- snapshot at order time -- see Phase 4/5 discussion on why this must
  -- never be a live reference to the addresses table

  customer_note text,          -- e.g. delivery instructions
  cancellation_reason text,
  cancelled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- ----------------------------------------------------------------------------
-- 3. order_items
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id bigint generated always as identity primary key,

  order_id bigint not null references public.orders(id) on delete cascade,

  variant_id bigint references public.product_variants(id) on delete set null,
  -- on delete set null (not restrict): this row's own snapshot columns
  -- below are what actually preserve the historical record, so losing the
  -- live variant link is fine. (In practice inventory_movements' own FK
  -- already blocks hard-deleting any variant that's ever shipped, so this
  -- is mostly a defensive choice.)

  product_name text not null,   -- snapshot: never show today's name for an old order
  sku text,

  unit_price numeric(12,2) not null check (unit_price >= 0),
  compare_at_price numeric(12,2),   -- snapshot, for "you saved Rs. X" on the order page
  check (compare_at_price is null or compare_at_price >= unit_price),

  quantity integer not null check (quantity > 0),

  subtotal numeric(12,2) not null check (subtotal >= 0),
  check (subtotal = unit_price * quantity),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_order_items_updated_at on public.order_items;
create trigger set_order_items_updated_at
  before update on public.order_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_variant_id on public.order_items(variant_id);

-- ----------------------------------------------------------------------------
-- 4. order_status_history
--    Append-only, same philosophy as inventory_movements in Phase 3 -- no
--    update/delete policy exists for anyone. Populated entirely by
--    triggers below, never inserted into directly by clients.
-- ----------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,

  order_id bigint not null references public.orders(id) on delete cascade,
  status text not null,
  note text,

  changed_by uuid references auth.users(id),

  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

-- ----------------------------------------------------------------------------
-- 5. Order lifecycle triggers
-- ----------------------------------------------------------------------------

-- 5a. Log the initial 'pending' status the moment an order is created
create or replace function public.log_initial_order_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.order_status_history (order_id, status, changed_by)
  values (new.id, new.status, new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_log_initial_order_status on public.orders;
create trigger trg_log_initial_order_status
  after insert on public.orders
  for each row
  execute function public.log_initial_order_status();

-- 5b. React to status transitions: log history, and apply the correct
--     inventory consequence for shipment or pre-shipment cancellation.
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

    -- Shipped: the reservation becomes a real sale. Decrement physical
    -- stock via the movements ledger (Phase 3 rejects this if it would
    -- somehow go negative) and release the hold.
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

    -- Cancelled before shipment: release the hold, no physical stock impact.
    -- (Cancelling an already-shipped order is a return, handled separately --
    -- this branch simply doesn't fire for that case.)
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

drop trigger if exists trg_handle_order_status_change on public.orders;
create trigger trg_handle_order_status_change
  before update of status on public.orders
  for each row
  execute function public.handle_order_status_change();

-- 5c. Reserve stock the moment an order_item is created. Locks the
--     inventory row and rejects the insert outright if not enough is
--     available -- which rolls back the whole order if create_order()
--     inserted this row as part of its transaction.
create or replace function public.reserve_inventory_for_order_item()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_available integer;
begin
  select available_quantity into v_available
  from public.inventory
  where variant_id = new.variant_id
  for update;

  if v_available is null or v_available < new.quantity then
    raise exception 'Insufficient stock for variant % (available %, requested %)',
      new.variant_id, coalesce(v_available, 0), new.quantity;
  end if;

  update public.inventory
  set reserved_quantity = reserved_quantity + new.quantity
  where variant_id = new.variant_id;

  return new;
end;
$$;

drop trigger if exists trg_reserve_inventory_for_order_item on public.order_items;
create trigger trg_reserve_inventory_for_order_item
  after insert on public.order_items
  for each row
  execute function public.reserve_inventory_for_order_item();

-- 5d. Guard against a customer tampering with their own order via a raw
--     client UPDATE. Admins bypass this entirely. Customers may only ever
--     flip status to 'cancelled' from 'pending'/'confirmed' -- every
--     money/identity field is locked once the order exists.
create or replace function public.restrict_customer_order_update()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status <> 'cancelled' or old.status not in ('pending', 'confirmed') then
      raise exception 'You can only cancel an order while it is pending or confirmed';
    end if;
  end if;

  if new.subtotal is distinct from old.subtotal
     or new.shipping_amount is distinct from old.shipping_amount
     or new.discount_amount is distinct from old.discount_amount
     or new.tax_amount is distinct from old.tax_amount
     or new.total_amount is distinct from old.total_amount
     or new.shipping_address is distinct from old.shipping_address
     or new.user_id is distinct from old.user_id
     or new.order_number is distinct from old.order_number
  then
    raise exception 'You are not allowed to modify this field on an order';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_restrict_customer_order_update on public.orders;
create trigger trg_restrict_customer_order_update
  before update on public.orders
  for each row
  execute function public.restrict_customer_order_update();

-- ----------------------------------------------------------------------------
-- 6. create_order() -- the sanctioned way to place an order.
--    Converts the caller's own cart into an order atomically: validates
--    the address, verifies every item is still purchasable, computes
--    totals from live prices, snapshots them into order_items (which
--    reserves stock per item via the trigger above), then clears the cart.
--    If anything fails partway, the entire order is rolled back -- no
--    partial reservations, no orphaned rows.
-- ----------------------------------------------------------------------------
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

  -- Ordered by variant_id so concurrent checkouts always acquire inventory
  -- row locks in the same sequence, avoiding lock-ordering deadlocks.
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

  delete from public.cart_items where cart_id = v_cart_id;

  return v_order;
end;
$$;

revoke execute on function public.create_order(bigint, text) from public;
grant execute on function public.create_order(bigint, text) to authenticated;

-- ============================================================================
-- 7. Row Level Security
-- ============================================================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- orders: customers read their own; admin reads all. Deliberately NO
-- client-side insert policy -- every order must go through create_order(),
-- which is SECURITY DEFINER and computes totals server-side. Admin gets an
-- insert policy for manual/phone orders. No delete policy for anyone --
-- orders are financial records and are never hard-deleted.
create policy "orders_select_own" on public.orders
  for select using (user_id = auth.uid());
create policy "orders_select_admin" on public.orders
  for select using (public.is_admin());
create policy "orders_insert_admin" on public.orders
  for insert with check (public.is_admin());
create policy "orders_update_own_or_admin" on public.orders
  for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
-- Note: trg_restrict_customer_order_update (above) is what actually limits
-- what a non-admin can change through this policy -- RLS handles row
-- access, the trigger handles field-level rules.

-- order_items: read-only for the owning customer; admin gets full CRUD
-- for manual corrections. No customer insert/update/delete -- items are
-- only ever created via create_order().
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid())
  );
create policy "order_items_all_admin" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- order_status_history: read-only for the owning customer and admin.
-- No insert/update/delete policy for anyone -- entirely trigger-managed.
create policy "order_status_history_select_own" on public.order_status_history
  for select using (
    exists (select 1 from public.orders o where o.id = order_status_history.order_id and o.user_id = auth.uid())
  );
create policy "order_status_history_select_admin" on public.order_status_history
  for select using (public.is_admin());