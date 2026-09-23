-- ============================================================================
-- 05. ORDERS SCHEMA & CHECKOUT ENGINE
-- orders, order_items, order_status_history, create_order() RPC
-- ============================================================================
-- Description:
--   Complete transactional order management and checkout engine.
--
-- Features:
--   - Stable URL-safe UUIDs (`public_id`) on all orders for customer/admin routes.
--   - Auto-generated business order numbers (e.g. `ORD-20260829-000001`).
--   - Snapshotting: Prices, product names, SKUs, and shipping addresses are frozen
--     at checkout time to ensure an immutable historical and financial audit record.
--   - Atomic Stock Reservations: Inserting an order item automatically checks
--     available inventory and holds stock (`reserved_quantity`).
--   - Order Lifecycle Automation:
--       * Status 'confirmed' clears the customer's cart items.
--       * Status 'shipped' records an inventory sale movement and releases the hold.
--       * Status 'cancelled' releases reserved stock holds safely.
--   - Security: Orders are strictly created through the `create_order()` RPC. Direct
--     client-side inserts are prevented via RLS, and field updates are restricted.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. orders
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,

  user_id uuid not null references auth.users(id),

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
  -- Snapshot at order time: immutable JSON object containing address fields

  payment_method text not null default 'cod' check (payment_method in ('razorpay', 'cod')),
  payment_id text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),

  customer_note text,
  cancellation_reason text,
  cancelled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is 'Master order records with server-computed totals and snapshotted address';
comment on column public.orders.public_id is 'URL-safe identifier for account order detail routes (e.g. /account/orders/{public_id})';
comment on column public.orders.shipping_address is 'Immutable snapshot of the shipping address at checkout';

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create unique index if not exists uq_orders_public_id on public.orders(public_id);

-- ----------------------------------------------------------------------------
-- 2. order_items
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id bigint generated always as identity primary key,

  order_id bigint not null references public.orders(id) on delete cascade,

  variant_id bigint references public.product_variants(id) on delete set null,
  -- on delete set null: snapshotted columns preserve the historical record

  product_name text not null,   -- Snapshot at order time
  sku text,

  unit_price numeric(12,2) not null check (unit_price >= 0),
  compare_at_price numeric(12,2),
  check (compare_at_price is null or compare_at_price >= unit_price),

  quantity integer not null check (quantity > 0),

  subtotal numeric(12,2) not null check (subtotal >= 0),
  check (subtotal = unit_price * quantity),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.order_items is 'Snapshotted order line items and pricing';

drop trigger if exists set_order_items_updated_at on public.order_items;
create trigger set_order_items_updated_at
  before update on public.order_items
  for each row
  execute function public.set_updated_at();

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_variant_id on public.order_items(variant_id);

-- ----------------------------------------------------------------------------
-- 3. order_status_history
-- ----------------------------------------------------------------------------
create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,

  order_id bigint not null references public.orders(id) on delete cascade,
  status text not null,
  note text,

  changed_by uuid references auth.users(id),

  created_at timestamptz not null default now()
);

comment on table public.order_status_history is 'Append-only order lifecycle status audit log';

create index if not exists idx_order_status_history_order_id on public.order_status_history(order_id);

-- ----------------------------------------------------------------------------
-- 4. Order Lifecycle Triggers
-- ----------------------------------------------------------------------------

-- 4a. Log the initial 'pending' status on order creation
create or replace function public.log_initial_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- 4b. Status transition handler: history logging, cart clearance, and inventory synchronization
create or replace function public.handle_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  if new.status is distinct from old.status then

    -- Log status change in audit history
    insert into public.order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth.uid());

    -- Order confirmed: clear the customer's cart
    if new.status = 'confirmed' and old.status = 'pending' then
      delete from public.cart_items
      where cart_id = (
        select id from public.carts where user_id = new.user_id
      );
    end if;

    -- Order shipped: deduct physical stock via movements ledger and release hold
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

    -- Pre-shipment cancellation: release stock reservations
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

-- 4c. Reserve stock when an order_item is created
create or replace function public.reserve_inventory_for_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
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

-- 4d. Protect orders against unauthorized client-side tampering
create or replace function public.restrict_customer_order_update()
returns trigger
language plpgsql
as $$
begin
  -- Admins have full update permissions
  if public.is_admin() then
    return new;
  end if;

  -- Customers can only cancel pending or confirmed orders
  if new.status is distinct from old.status then
    if new.status <> 'cancelled' or old.status not in ('pending', 'confirmed') then
      raise exception 'You can only cancel an order while it is pending or confirmed';
    end if;
  end if;

  -- Customers cannot alter amounts, addresses, or identifiers
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
-- 5. Checkout RPC: create_order()
-- ----------------------------------------------------------------------------
-- Atomically validates the caller's cart, checks item availability, calculates
-- server-side totals, snapshots addresses and item prices, locks and reserves
-- inventory, and provisions the pending order.
create or replace function public.create_order(
  p_address_id bigint,
  p_customer_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cart_id uuid;
  v_address record;
  v_order public.orders;
  v_subtotal numeric(12,2) := 0;
  v_item record;
begin
  -- Retrieve user's cart
  select id into v_cart_id from public.carts where user_id = auth.uid();
  if v_cart_id is null then
    raise exception 'No cart found for current user';
  end if;

  -- Verify cart is not empty
  if not exists (select 1 from public.cart_items where cart_id = v_cart_id) then
    raise exception 'Cart is empty';
  end if;

  -- Validate delivery address
  select * into v_address from public.addresses
  where id = p_address_id and user_id = auth.uid();
  if v_address is null then
    raise exception 'Address not found';
  end if;

  -- Ensure all cart items are active and belong to active products
  if exists (
    select 1 from public.cart_items ci
    join public.product_variants pv on pv.id = ci.variant_id
    join public.products p on p.id = pv.product_id
    where ci.cart_id = v_cart_id
      and (pv.is_active = false or p.status <> 'active')
  ) then
    raise exception 'One or more items in your cart are no longer available';
  end if;

  -- Calculate subtotal dynamically from current database prices
  select coalesce(sum(pv.price * ci.quantity), 0) into v_subtotal
  from public.cart_items ci
  join public.product_variants pv on pv.id = ci.variant_id
  where ci.cart_id = v_cart_id;

  -- Insert order record (status = pending)
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

  -- Insert order items in deterministic order to prevent lock deadlocks
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

  -- Note: Cart remains intact until payment confirmation (status becomes 'confirmed')
  return v_order;
end;
$$;

revoke execute on function public.create_order(bigint, text) from public;
grant execute on function public.create_order(bigint, text) to authenticated;

-- ============================================================================
-- 6. Row Level Security (Orders)
-- ============================================================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- orders
create policy "orders_select_own" on public.orders
  for select using (user_id = (select auth.uid()));

create policy "orders_select_admin" on public.orders
  for select using ((select public.is_admin()));

create policy "orders_insert_admin" on public.orders
  for insert with check ((select public.is_admin()));

create policy "orders_insert_own" on public.orders
  for insert with check (user_id = (select auth.uid()));

create policy "orders_update_own_or_admin" on public.orders
  for update
  using (user_id = (select auth.uid()) or (select public.is_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_admin()));

-- order_items
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );

create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );

create policy "order_items_all_admin" on public.order_items
  for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- order_status_history
create policy "order_status_history_select_own" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_history.order_id and o.user_id = (select auth.uid())
    )
  );

create policy "order_status_history_select_admin" on public.order_status_history
  for select using ((select public.is_admin()));
