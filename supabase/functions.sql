-- Helper and action functions (SECURITY DEFINER) for Supabase
set search_path = public;

-- Admin check: does current user have admin/superadmin role?
create or replace function public.auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','superadmin')
  );
$$;

-- Ownership helpers
create or replace function public.is_coupon_owned_by_user(_coupon_id uuid, _uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.coupons c
    join public.businesses b on b.id = c.merchant_id
    where c.id = _coupon_id and b.id = _uid
  );
$$;

create or replace function public.is_product_owned_by_user(_product_id uuid, _uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.products p where p.id = _product_id and p.owner_id = _uid
  );
$$;

create or replace function public.escrow_participant(_escrow_id uuid, _uid uuid)
returns text language sql stable as $$
  select case when e.buyer_id = _uid then 'buyer' when e.seller_id = _uid then 'seller' else null end
  from public.escrows e where e.id = _escrow_id
$$;

-- Purchase coupon: inserts order, decrements remaining, assigns QR secret
create or replace function public.purchase_coupon(_coupon_id uuid)
returns public.coupon_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons;
  v_order public.coupon_orders;
begin
  select * into v_coupon from public.coupons where id = _coupon_id for update;
  if not found then
    raise exception 'Coupon not found';
  end if;
  if v_coupon.remaining <= 0 then
    raise exception 'Coupon out of stock';
  end if;
  insert into public.coupon_orders(coupon_id, user_id, status, amount, valid_until)
  values (_coupon_id, auth.uid(), 'active', coalesce(v_coupon.price, 0), coalesce(v_coupon.offer_ends_at, now() + interval '30 days'))
  returning * into v_order;
  update public.coupons set remaining = remaining - 1 where id = _coupon_id;
  return v_order;
end;$$;

-- Redeem coupon: only merchant can redeem valid active order
create or replace function public.redeem_coupon(_order_id uuid)
returns public.coupon_redemptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.coupon_orders;
  v_coupon public.coupons;
  v_red public.coupon_redemptions;
begin
  select * into v_order from public.coupon_orders where id = _order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status <> 'active' then raise exception 'Order not active'; end if;
  if v_order.valid_until is not null and v_order.valid_until < now() then raise exception 'Order expired'; end if;
  select * into v_coupon from public.coupons where id = v_order.coupon_id;
  if v_coupon.merchant_id is distinct from auth.uid() then
    raise exception 'Not authorized to redeem this order';
  end if;
  insert into public.coupon_redemptions(order_id, merchant_id)
  values (_order_id, v_coupon.merchant_id)
  returning * into v_red;
  update public.coupon_orders set status = 'redeemed' where id = _order_id;
  return v_red;
end;$$;

-- Create escrow: buyer is current user
create or replace function public.create_escrow(_product_id uuid, _title text, _seller_id uuid, _window_hours int default 72)
returns public.escrows
language plpgsql
security definer
set search_path = public
as $$
declare
  v_esc public.escrows;
begin
  insert into public.escrows(product_id, title, buyer_id, seller_id, status, countdown_ends_at)
  values (_product_id, _title, auth.uid(), _seller_id, 'held', now() + make_interval(hours => coalesce(_window_hours,72)))
  returning * into v_esc;
  return v_esc;
end;$$;

create or replace function public.escrow_confirm_shipment(_escrow_id uuid, _tracking text)
returns public.escrows language plpgsql security definer set search_path = public as $$
declare v public.escrows; begin
  select * into v from public.escrows where id = _escrow_id for update;
  if not found then raise exception 'Escrow not found'; end if;
  if v.seller_id is distinct from auth.uid() then raise exception 'Not seller'; end if;
  update public.escrows set status = 'shipped', tracking = _tracking where id = _escrow_id returning * into v;
  return v; end; $$;

create or replace function public.escrow_confirm_delivery(_escrow_id uuid)
returns public.escrows language plpgsql security definer set search_path = public as $$
declare v public.escrows; begin
  select * into v from public.escrows where id = _escrow_id for update;
  if not found then raise exception 'Escrow not found'; end if;
  if v.buyer_id is distinct from auth.uid() then raise exception 'Not buyer'; end if;
  update public.escrows set status = 'delivered' where id = _escrow_id returning * into v;
  return v; end; $$;

create or replace function public.escrow_release_funds(_escrow_id uuid)
returns public.escrows language plpgsql security definer set search_path = public as $$
declare v public.escrows; begin
  select * into v from public.escrows where id = _escrow_id for update;
  if not found then raise exception 'Escrow not found'; end if;
  if v.buyer_id is distinct from auth.uid() then raise exception 'Not buyer'; end if;
  update public.escrows set status = 'released' where id = _escrow_id returning * into v;
  return v; end; $$;

create or replace function public.escrow_open_dispute(_escrow_id uuid)
returns public.escrows language plpgsql security definer set search_path = public as $$
declare v public.escrows; begin
  select * into v from public.escrows where id = _escrow_id for update;
  if not found then raise exception 'Escrow not found'; end if;
  if v.buyer_id is distinct from auth.uid() then raise exception 'Not buyer'; end if;
  update public.escrows set status = 'disputed' where id = _escrow_id returning * into v;
  return v; end; $$;

create or replace function public.escrow_send_message(_escrow_id uuid, _text text)
returns public.escrow_messages language plpgsql security definer set search_path = public as $$
declare role text; msg public.escrow_messages; begin
  select public.escrow_participant(_escrow_id, auth.uid()) into role;
  if role is null then raise exception 'Not a participant'; end if;
  insert into public.escrow_messages(escrow_id, author, text)
  values (_escrow_id, role, _text)
  returning * into msg;
  return msg; end; $$;

