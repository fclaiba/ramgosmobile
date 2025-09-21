-- Row Level Security policies
alter table public.profiles enable row level security;
alter table public.followers enable row level security;
alter table public.businesses enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_images enable row level security;
alter table public.coupon_orders enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.escrows enable row level security;
alter table public.escrow_messages enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.events enable row level security;
alter table public.event_orders enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.comment_likes enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.moderation_items enable row level security;
alter table public.moderation_decisions enable row level security;
alter table public.referrals enable row level security;

-- Profiles: users can read all, update own
create policy if not exists profiles_read on public.profiles for select using (true);
create policy if not exists profiles_update_own on public.profiles for update using (id = auth.uid());
create policy if not exists profiles_insert_self on public.profiles for insert with check (id = auth.uid());

-- Followers: user can read, create/delete their relations
create policy if not exists followers_read on public.followers for select using (true);
create policy if not exists followers_insert on public.followers for insert with check (follower_id = auth.uid());
create policy if not exists followers_delete on public.followers for delete using (follower_id = auth.uid());

-- Businesses: only owner can insert/update; readable by all
create policy if not exists businesses_read on public.businesses for select using (true);
create policy if not exists businesses_write on public.businesses for all using (id = auth.uid()) with check (id = auth.uid());

-- Coupons: readable by all; merchant can write
create policy if not exists coupons_read on public.coupons for select using (true);
create policy if not exists coupons_write on public.coupons for all using (merchant_id = auth.uid()) with check (merchant_id = auth.uid());
create policy if not exists coupon_images_read on public.coupon_images for select using (true);
create policy if not exists coupon_images_write on public.coupon_images for all using (exists (select 1 from public.coupons c where c.id = coupon_id and c.merchant_id = auth.uid())) with check (exists (select 1 from public.coupons c where c.id = coupon_id and c.merchant_id = auth.uid()));

-- Coupon orders: only owner reads own; insert via function; merchant can see orders for their coupons
create policy if not exists coupon_orders_read_owner on public.coupon_orders for select using (user_id = auth.uid());
create policy if not exists coupon_orders_read_merchant on public.coupon_orders for select using (exists (select 1 from public.coupons c where c.id = coupon_id and c.merchant_id = auth.uid()));
create policy if not exists coupon_orders_update_owner on public.coupon_orders for update using (user_id = auth.uid());

create policy if not exists coupon_redemptions_read on public.coupon_redemptions for select using (
  exists (select 1 from public.coupon_orders o where o.id = order_id and (o.user_id = auth.uid() or exists (select 1 from public.coupons c where c.id = o.coupon_id and c.merchant_id = auth.uid())))
);

-- Products: readable by all; owner writes
create policy if not exists products_read on public.products for select using (true);
create policy if not exists products_write on public.products for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy if not exists product_images_read on public.product_images for select using (true);
create policy if not exists product_images_write on public.product_images for all using (exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())) with check (exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid()));

-- Escrows: participants can read/update; insert via function
create policy if not exists escrows_read on public.escrows for select using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy if not exists escrows_update_participant on public.escrows for update using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy if not exists escrow_messages_read on public.escrow_messages for select using (exists (select 1 from public.escrows e where e.id = escrow_id and (e.buyer_id = auth.uid() or e.seller_id = auth.uid())));

-- Payments: users can read their own
create policy if not exists payments_read on public.payments for select using (user_id = auth.uid());
create policy if not exists payments_insert_self on public.payments for insert with check (user_id = auth.uid());
create policy if not exists payments_update_self on public.payments for update using (user_id = auth.uid());

-- Reviews: readable for profile owner and public listing; author can write
create policy if not exists reviews_read on public.reviews for select using (true);
create policy if not exists reviews_write on public.reviews for insert with check (author_id = auth.uid());
create policy if not exists reviews_update_author on public.reviews for update using (author_id = auth.uid());
create policy if not exists reviews_delete_author on public.reviews for delete using (author_id = auth.uid());

-- Events and orders
create policy if not exists events_read on public.events for select using (true);
create policy if not exists events_write on public.events for all using (organizer_id = auth.uid()) with check (organizer_id = auth.uid());
create policy if not exists event_orders_read on public.event_orders for select using (user_id = auth.uid());
create policy if not exists event_orders_insert on public.event_orders for insert with check (user_id = auth.uid());

-- Social posts/comments/likes/messages
create policy if not exists posts_read on public.posts for select using (true);
create policy if not exists posts_write on public.posts for all using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy if not exists comments_read on public.comments for select using (true);
create policy if not exists comments_write on public.comments for all using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy if not exists post_likes_read on public.post_likes for select using (true);
create policy if not exists post_likes_write on public.post_likes for insert with check (user_id = auth.uid());
create policy if not exists comment_likes_read on public.comment_likes for select using (true);
create policy if not exists comment_likes_write on public.comment_likes for insert with check (user_id = auth.uid());
create policy if not exists messages_read on public.messages for select using (from_user_id = auth.uid() or to_user_id = auth.uid());
create policy if not exists messages_write on public.messages for insert with check (from_user_id = auth.uid());

-- Notifications
create policy if not exists notifications_read on public.notifications for select using (recipient_id = auth.uid());
create policy if not exists notifications_update_read on public.notifications for update using (recipient_id = auth.uid());

-- Moderation (admin only)
create policy if not exists moderation_items_read on public.moderation_items for select using (public.auth_is_admin());
create policy if not exists moderation_items_write on public.moderation_items for all using (public.auth_is_admin()) with check (public.auth_is_admin());
create policy if not exists moderation_decisions_read on public.moderation_decisions for select using (public.auth_is_admin());
create policy if not exists moderation_decisions_write on public.moderation_decisions for all using (public.auth_is_admin()) with check (public.auth_is_admin());

-- Referrals: public read, admin write
create policy if not exists referrals_read on public.referrals for select using (true);
create policy if not exists referrals_write on public.referrals for all using (public.auth_is_admin()) with check (public.auth_is_admin());

