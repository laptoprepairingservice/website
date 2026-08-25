-- ============================================================================
-- PHASE 3: INVENTORY
-- inventory, inventory_movements
--
-- The core idea in this phase: `inventory.quantity` is never edited
-- directly. It is a cache that is only ever derived from the append-only
-- `inventory_movements` ledger. This gives you:
--   - a full audit trail of every stock change and why it happened
--   - protection against overselling (a movement that would push stock
--     negative is rejected at the database level, with a row lock so two
--     simultaneous sales can't both succeed against the same last unit)
--   - a single source of truth that can't drift out of sync with history
--
-- Beyond the basic sketch, this migration adds:
--   - inventory: reserved_quantity vs quantity vs a generated
--     available_quantity, a low_stock_threshold, and a trigger that blocks
--     any *direct* edit of quantity (must go through a movement)
--   - product_variants: a new-variant trigger that auto-creates its
--     inventory row, so admins never manually INSERT into inventory
--   - inventory_movements: reference_type alongside reference_id (the
--     original design's bare reference_id doesn't say which table it
--     points to), an 'adjustment' type for manual corrections, created_by
--     defaulting to the acting user, and it's fully immutable — no
--     update/delete policy exists for anyone, corrections are new rows
--   - a curated public view so the storefront can show stock availability
--     without exposing reserved_quantity / low_stock_threshold to shoppers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. inventory
-- ----------------------------------------------------------------------------
create table if not exists public.inventory (
  variant_id bigint primary key
    references public.product_variants(id) on delete cascade,

  quantity integer not null default 0,
  reserved_quantity integer not null default 0,

  available_quantity integer generated always as (quantity - reserved_quantity) stored,

  low_stock_threshold integer not null default 5,

  updated_at timestamptz not null default now(),

  check (quantity >= 0),
  check (reserved_quantity >= 0),
  check (reserved_quantity <= quantity)
);

comment on column public.inventory.quantity is 'Physical stock on hand. Never update directly — insert into inventory_movements instead.';
comment on column public.inventory.reserved_quantity is 'Portion of quantity allocated to unfulfilled orders/carts; not yet shipped.';
comment on column public.inventory.available_quantity is 'quantity - reserved_quantity, i.e. what can still be sold right now.';

drop trigger if exists set_inventory_updated_at on public.inventory;
create trigger set_inventory_updated_at
  before update on public.inventory
  for each row
  execute function public.set_updated_at();

create index if not exists idx_inventory_available_quantity on public.inventory(available_quantity);

-- Block any direct write to `quantity`. pg_trigger_depth() <= 1 means this
-- UPDATE was issued directly (not from inside another trigger) — the
-- movement-applying trigger below runs one level deeper, so it's unaffected.
create or replace function public.prevent_direct_quantity_change()
returns trigger
language plpgsql
as $$
begin
  if new.quantity is distinct from old.quantity and pg_trigger_depth() <= 1 then
    raise exception 'inventory.quantity cannot be changed directly — insert a row into inventory_movements instead';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_direct_quantity_change on public.inventory;
create trigger trg_prevent_direct_quantity_change
  before update of quantity on public.inventory
  for each row
  execute function public.prevent_direct_quantity_change();

-- Every new variant automatically gets a tracking row (quantity 0).
-- Admins then record a 'purchase' or 'restock' movement to add real stock —
-- they never INSERT into inventory by hand.
create or replace function public.create_inventory_row_for_variant()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.inventory (variant_id) values (new.id)
  on conflict (variant_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_inventory_for_variant on public.product_variants;
create trigger trg_create_inventory_for_variant
  after insert on public.product_variants
  for each row
  execute function public.create_inventory_row_for_variant();

-- ----------------------------------------------------------------------------
-- 2. inventory_movements
--    Append-only audit ledger. No update/delete policy is defined for this
--    table anywhere — that's intentional. To correct a mistake, insert a
--    new offsetting movement (e.g. movement_type='adjustment') and explain
--    why in `note`; never edit or remove a historical row.
-- ----------------------------------------------------------------------------
create table if not exists public.inventory_movements (
  id bigint generated always as identity primary key,

  variant_id bigint not null references public.product_variants(id),
  -- Deliberately no ON DELETE CASCADE here (default is effectively RESTRICT):
  -- a variant with movement history can't be hard-deleted, which is the
  -- point — archive it (product_variants.is_active = false) instead.

  quantity_change integer not null check (quantity_change <> 0),

  movement_type text not null check (
    movement_type in ('purchase', 'sale', 'return', 'damaged', 'restock', 'adjustment')
  ),
  -- purchase   = stock received from a supplier
  -- sale       = decremented because an order shipped
  -- return     = customer sent an item back
  -- damaged    = written off (breakage, loss, failed QC)
  -- restock    = manual replenishment not tied to a specific purchase
  -- adjustment = manual correction after a stock count discrepancy

  reference_type text check (reference_type in ('order', 'purchase_order', 'manual', 'other')),
  reference_id bigint,
  -- reference_type + reference_id together point at the record that caused
  -- this movement (e.g. an order). This is a "soft" reference — it can
  -- point at different tables depending on reference_type, so it's not a
  -- real foreign key. Integrity here is an application-layer concern; the
  -- trade-off is accepted because a single ledger needs to reference many
  -- different source tables (orders now, purchase orders later, etc).

  note text,

  created_by uuid references auth.users(id) default auth.uid(),

  created_at timestamptz not null default now()
);

comment on table public.inventory_movements is 'Append-only stock ledger — never updated or deleted, only inserted.';

create index if not exists idx_inventory_movements_variant_id on public.inventory_movements(variant_id);
create index if not exists idx_inventory_movements_type on public.inventory_movements(movement_type);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);
create index if not exists idx_inventory_movements_reference on public.inventory_movements(reference_type, reference_id);

-- The engine: applying a movement to inventory.quantity, with row-level
-- locking (FOR UPDATE) so two concurrent sales can't both oversell the same
-- last unit, and a hard rejection if the result would go negative.
create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  current_qty integer;
begin
  select quantity into current_qty
  from public.inventory
  where variant_id = new.variant_id
  for update;

  if current_qty is null then
    if new.quantity_change < 0 then
      raise exception 'Cannot create negative inventory for variant %', new.variant_id;
    end if;
    insert into public.inventory (variant_id, quantity)
    values (new.variant_id, new.quantity_change);
  else
    if current_qty + new.quantity_change < 0 then
      raise exception 'Insufficient stock for variant % (have %, requested change %)',
        new.variant_id, current_qty, new.quantity_change;
    end if;
    update public.inventory
    set quantity = current_qty + new.quantity_change
    where variant_id = new.variant_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_inventory_movement on public.inventory_movements;
create trigger trg_apply_inventory_movement
  after insert on public.inventory_movements
  for each row
  execute function public.apply_inventory_movement();

-- ============================================================================
-- 3. Row Level Security
-- ============================================================================
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;

-- inventory: admin-only. Exact stock counts, reservations, and reorder
-- thresholds are internal business data — shoppers get a curated view
-- instead (see product_stock_status below).
create policy "inventory_select_admin"
  on public.inventory for select
  using (public.is_admin());

create policy "inventory_update_admin"
  on public.inventory for update
  using (public.is_admin())
  with check (public.is_admin());
-- No insert policy: rows are created only by trg_create_inventory_for_variant.
-- No delete policy: rows are removed only via the variant's own cascade.

-- inventory_movements: admin can read the ledger and add new entries.
-- No update or delete policy exists for ANY role — see the note on the
-- table above.
create policy "inventory_movements_select_admin"
  on public.inventory_movements for select
  using (public.is_admin());

create policy "inventory_movements_insert_admin"
  on public.inventory_movements for insert
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Public stock-status view
--    Lets the storefront show "In stock" / "Only 3 left" without granting
--    shoppers access to the inventory table itself.
--
--    NOTE: this view is intentionally created WITHOUT `security_invoker`,
--    so it runs with its owner's privileges and can read the admin-only
--    `inventory` table on the caller's behalf. It only ever exposes
--    variant_id + available_quantity, and only for variants belonging to
--    published products — the view itself is the security boundary here.
--    Do not "fix" this by adding security_invoker = true, or the
--    storefront will stop being able to show stock at all.
-- ----------------------------------------------------------------------------
create or replace view public.product_stock_status as
select
  i.variant_id,
  i.available_quantity
from public.inventory i
join public.product_variants v on v.id = i.variant_id
join public.products p on p.id = v.product_id
where v.is_active = true
  and p.status = 'active';

grant select on public.product_stock_status to anon, authenticated;