-- Minimal seed data (adjust IDs to your project's auth.users)
set search_path = public;

-- Create demo profiles (replace UUIDs)
-- Assuming you have created users in auth; otherwise, insert into auth.users first via Supabase UI or CLI.
insert into public.profiles(id, handle, name, role, avatar_url)
values
  ('00000000-0000-0000-0000-000000000001','sofia','Sofía','business','https://i.pravatar.cc/150?u=1')
on conflict (id) do nothing;

insert into public.profiles(id, handle, name, role, avatar_url)
values
  ('00000000-0000-0000-0000-000000000002','max','Max','consumer','https://i.pravatar.cc/150?u=2')
on conflict (id) do nothing;

insert into public.businesses(id, display_name, verified)
values ('00000000-0000-0000-0000-000000000001','Aventura SRL', true)
on conflict (id) do nothing;

-- Coupon + images
insert into public.coupons(merchant_id, title, description, sector, price, original_price, remaining, offer_ends_at, rating_avg, rating_count, location_lat, location_lng)
values ('00000000-0000-0000-0000-000000000001','Bono de Aventura Extrema','Atrévete a vivir emociones fuertes','aventura',49,79,10, now() + interval '15 days', 4.6, 87, -34.60, -58.38);

-- Products
insert into public.products(owner_id, title, description, price, condition, location, category, shipping)
values ('00000000-0000-0000-0000-000000000001','Cámara digital','Cámara compacta de alta resolución',150,'used','Centro','Electrónica','free')
on conflict do nothing;

-- Simple event
insert into public.events(organizer_id, title, description, price, location, date, category)
values ('00000000-0000-0000-0000-000000000001','Festival de Música Indie','Bandas locales y food trucks',25,'Centro', now() + interval '7 days','Música')
on conflict do nothing;

