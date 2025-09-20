-- Supabase schema: core types, tables, and constraints
-- Safe to run multiple times (IF NOT EXISTS guards where possible)

-- Extensions
create extension if not exists pgcrypto;

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

-- =====================
-- ENUM TYPES
-- =====================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('consumer','business','influencer','admin','superadmin');
  end if;
  if not exists (select 1 from pg_type where typname = 'coupon_sector') then
    create type public.coupon_sector as enum ('gastronomia','aventura','bienestar','cultura','otros');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('active','redeemed','expired','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'product_condition') then
    create type public.product_condition as enum ('new','used','refurbished');
  end if;
  if not exists (select 1 from pg_type where typname = 'shipping_kind') then
    create type public.shipping_kind as enum ('free','paid');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('completed','pending','cancelled','refunded','failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('card','wallet','cash','transfer');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_kind') then
    create type public.payment_kind as enum ('purchase','payout','refund','fee','escrow_release','escrow_hold');
  end if;
  if not exists (select 1 from pg_type where typname = 'escrow_status') then
    create type public.escrow_status as enum ('held','shipped','delivered','released','disputed','abandoned','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'moderation_type') then
    create type public.moderation_type as enum ('profile_photo','bio','comment','video');
  end if;
  if not exists (select 1 from pg_type where typname = 'moderation_status') then
    create type public.moderation_status as enum ('pending','approved','rejected','banned','escalated');
  end if;
  if not exists (select 1 from pg_type where typname = 'moderation_action') then
    create type public.moderation_action as enum ('approve','reject','ban','escalate');
  end if;
  if not exists (select 1 from pg_type where typname = 'event_order_status') then
    create type public.event_order_status as enum ('active','used','expired','cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'notification_kind') then
    create type public.notification_kind as enum ('payment','follower','system','message');
  end if;
  if not exists (select 1 from pg_type where typname = 'priority_kind') then
    create type public.priority_kind as enum ('high','normal');
  end if;
end $$;

-- =====================
-- CORE: profiles, roles, following
-- =====================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  name text,
  avatar_url text,
  role public.user_role not null default 'consumer',
  followers_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();

create table if not exists public.followers (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists public.businesses (
  id uuid primary key references public.profiles(id) on delete cascade,
  display_name text,
  verified boolean not null default false,
  tnc_accepted_at timestamptz
);

-- =====================
-- COUPONS
-- =====================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text not null,
  sector public.coupon_sector not null,
  price numeric(10,2) not null check (price >= 0),
  original_price numeric(10,2),
  remaining int not null default 0 check (remaining >= 0),
  offer_ends_at timestamptz,
  rating_avg numeric(3,1) not null default 0,
  rating_count int not null default 0,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_coupons_updated on public.coupons;
create trigger trg_coupons_updated before update on public.coupons for each row execute function public.set_updated_at();

create table if not exists public.coupon_images (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  url text not null,
  position int not null default 0
);

create table if not exists public.coupon_orders (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.order_status not null default 'active',
  amount numeric(10,2) not null default 0,
  valid_until timestamptz,
  qr_secret text not null unique default encode(gen_random_bytes(10), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_coupon_orders_updated on public.coupon_orders;
create trigger trg_coupon_orders_updated before update on public.coupon_orders for each row execute function public.set_updated_at();

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.coupon_orders(id) on delete cascade,
  merchant_id uuid not null references public.businesses(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

-- =====================
-- PRODUCTS / MARKETPLACE
-- =====================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  condition public.product_condition not null,
  location text,
  rating_avg numeric(3,1) not null default 0,
  rating_count int not null default 0,
  badge text,
  category text,
  shipping public.shipping_kind not null default 'paid',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products for each row execute function public.set_updated_at();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0
);

-- =====================
-- ESCROW
-- =====================
create table if not exists public.escrows (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  product_id uuid references public.products(id) on delete set null,
  title text not null,
  buyer_id uuid references public.profiles(id) on delete set null,
  seller_id uuid references public.profiles(id) on delete set null,
  status public.escrow_status not null default 'held',
  tracking text,
  countdown_ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_escrows_updated on public.escrows;
create trigger trg_escrows_updated before update on public.escrows for each row execute function public.set_updated_at();

create table if not exists public.escrow_messages (
  id uuid primary key default gen_random_uuid(),
  escrow_id uuid not null references public.escrows(id) on delete cascade,
  author text not null check (author in ('buyer','seller')),
  text text not null,
  created_at timestamptz not null default now()
);

-- =====================
-- PAYMENTS / TRANSACTIONS
-- =====================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  counterparty_id uuid references public.profiles(id) on delete set null,
  title text not null,
  amount numeric(12,2) not null,
  status public.payment_status not null,
  kind public.payment_kind not null,
  method public.payment_method not null,
  escrow_id uuid references public.escrows(id) on delete set null,
  order_id uuid references public.coupon_orders(id) on delete set null,
  stripe_payment_intent_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- =====================
-- REVIEWS / REPUTATION
-- =====================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz not null default now(),
  unique (user_id, author_id, created_at)
);

-- =====================
-- EVENTS
-- =====================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  image_url text,
  price numeric(10,2) not null default 0,
  location text,
  date timestamptz not null,
  category text,
  rating_avg numeric(3,1) not null default 0,
  rating_count int not null default 0,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.event_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  title text not null,
  status public.event_order_status not null default 'active',
  date timestamptz not null,
  amount numeric(10,2) not null default 0,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- =====================
-- SOCIAL
-- =====================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text,
  image_url text,
  likes_count int not null default 0,
  retweets_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  likes_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  to_user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- =====================
-- NOTIFICATIONS
-- =====================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  data jsonb,
  priority public.priority_kind not null default 'normal',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================
-- MODERATION
-- =====================
create table if not exists public.moderation_items (
  id uuid primary key default gen_random_uuid(),
  user_handle text not null,
  type public.moderation_type not null,
  reason text not null,
  confidence numeric not null check (confidence between 0 and 1),
  current_content text,
  suggested_content text,
  reported_at timestamptz not null default now(),
  status public.moderation_status not null default 'pending'
);

create table if not exists public.moderation_decisions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.moderation_items(id) on delete cascade,
  content_label text not null,
  action public.moderation_action not null,
  moderator_id uuid not null references public.profiles(id) on delete cascade,
  decided_at timestamptz not null default now()
);

-- =====================
-- REFERRALS
-- =====================
create table if not exists public.referrals (
  code text primary key,
  influencer_id uuid references public.profiles(id) on delete set null,
  discount_pct int not null check (discount_pct between 0 and 100),
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_coupons_sector on public.coupons(sector);
create index if not exists idx_coupon_orders_user on public.coupon_orders(user_id);
create index if not exists idx_products_owner on public.products(owner_id);
create index if not exists idx_escrows_parties on public.escrows(buyer_id, seller_id);
create index if not exists idx_payments_user_created on public.payments(user_id, created_at);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_posts_author on public.posts(author_id);
create index if not exists idx_comments_post on public.comments(post_id);
create index if not exists idx_messages_to_user on public.messages(to_user_id, created_at);

-- Generated code for escrows (optional helper)
create or replace function public.generate_escrow_code()
returns text language sql as $$
  select upper('A' || substr(encode(gen_random_bytes(3),'hex'),1,6));
$$;

update public.escrows set code = coalesce(code, public.generate_escrow_code());
alter table public.escrows alter column code set default public.generate_escrow_code();

-- End of schema

