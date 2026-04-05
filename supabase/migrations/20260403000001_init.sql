-- =============================================================
-- PrintYourVibe — Full Schema + Seed Migration
-- =============================================================

-- ── 1. Extensions ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1.5. Security Helper: is_admin ───────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ── 2. Helper: updated_at trigger ─────────────────────────────
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 3. Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'user' check (role in ('user','admin')),
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users can view their own profile"   on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can manage all profiles"     on public.profiles;
create policy "Users can view their own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can manage all profiles"     on public.profiles for all
  using (public.is_admin());

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 4. Categories ──────────────────────────────────────────────
create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  slug        text unique not null,
  description text,
  image_url   text,
  sort_order  int default 0
);
alter table public.categories enable row level security;
drop policy if exists "Anyone can read categories"   on public.categories;
drop policy if exists "Admins can manage categories" on public.categories;
create policy "Anyone can read categories"   on public.categories for select using (true);
create policy "Admins can manage categories" on public.categories for all
  using (public.is_admin());

-- ── 5. Products ────────────────────────────────────────────────
create table if not exists public.products (
  id            text primary key,
  category_id   text references public.categories(id) on delete set null,
  name          text not null,
  slug          text unique not null,
  description   text,
  base_price    numeric(10,2) not null,
  compare_price numeric(10,2),
  rating        numeric(3,1) default 5.0,
  review_count  int default 0,
  is_featured   boolean default false,
  active        boolean default true,
  print_area    jsonb,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.products enable row level security;
drop policy if exists "Anyone can read active products" on public.products;
drop policy if exists "Admins can manage products"      on public.products;
create policy "Anyone can read active products" on public.products for select using (active = true);
create policy "Admins can manage products"      on public.products for all
  using (public.is_admin());

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at before update on public.products
  for each row execute function public.update_updated_at_column();

-- ── 6. Product Colours ─────────────────────────────────────────
create table if not exists public.product_colours (
  id                text primary key,
  product_id        text references public.products(id) on delete cascade,
  name              text not null,
  hex               text not null,
  mockup_front_url  text,
  mockup_back_url   text,
  sort_order        int default 0
);
alter table public.product_colours enable row level security;
drop policy if exists "Anyone can read product colours"   on public.product_colours;
drop policy if exists "Admins can manage product colours" on public.product_colours;
create policy "Anyone can read product colours"   on public.product_colours for select using (true);
create policy "Admins can manage product colours" on public.product_colours for all
  using (public.is_admin());

-- ── 7. Product Sizes ───────────────────────────────────────────
create table if not exists public.product_sizes (
  id              uuid primary key default gen_random_uuid(),
  product_id      text references public.products(id) on delete cascade,
  label           text not null,
  price_modifier  numeric(10,2) default 0,
  sort_order      int default 0,
  unique (product_id, label)
);
alter table public.product_sizes enable row level security;
drop policy if exists "Anyone can read product sizes"   on public.product_sizes;
drop policy if exists "Admins can manage product sizes" on public.product_sizes;
create policy "Anyone can read product sizes"   on public.product_sizes for select using (true);
create policy "Admins can manage product sizes" on public.product_sizes for all
  using (public.is_admin());

-- ── 8. Product Gallery ─────────────────────────────────────────
create table if not exists public.product_gallery (
  id          uuid primary key default gen_random_uuid(),
  product_id  text references public.products(id) on delete cascade,
  url         text not null,
  sort_order  int default 0
);
alter table public.product_gallery enable row level security;
drop policy if exists "Anyone can read gallery"   on public.product_gallery;
drop policy if exists "Admins can manage gallery" on public.product_gallery;
create policy "Anyone can read gallery"   on public.product_gallery for select using (true);
create policy "Admins can manage gallery" on public.product_gallery for all
  using (public.is_admin());

-- ── 9. Orders ──────────────────────────────────────────────────
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  order_number          text unique not null,
  user_id               uuid references auth.users(id) on delete set null,
  status                text not null default 'pending'
                        check (status in ('pending','confirmed','printing','dispatched','delivered','cancelled','refunded')),
  subtotal_pence        int not null default 0,
  shipping_pence        int not null default 0,
  discount_pence        int not null default 0,
  total_pence           int not null default 0,
  coupon_code           text,
  stripe_session_id     text unique,
  stripe_payment_intent text,
  items                 jsonb not null default '[]',
  history               jsonb not null default '[]',
  tracking_number       text,
  tracking_url          text,
  shipping_name         text,
  shipping_email        text,
  shipping_address_1    text,
  shipping_address_2    text,
  shipping_city         text,
  shipping_postcode     text,
  shipping_country      text default 'GB',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
alter table public.orders enable row level security;
drop policy if exists "Admins can manage all orders"      on public.orders;
drop policy if exists "Users can view their own orders"   on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Admins can manage all orders"      on public.orders for all
  using (public.is_admin());
create policy "Users can view their own orders"   on public.orders for select
  using (auth.uid() = user_id);
create policy "Users can insert their own orders" on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at before update on public.orders
  for each row execute function public.update_updated_at_column();

-- ── 10. Coupons ────────────────────────────────────────────────
create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  type        text not null check (type in ('percent','fixed')),
  value       numeric(10,2) not null,
  min_order   numeric(10,2) default 0,
  max_uses    int,
  used_count  int default 0,
  expires_at  timestamptz,
  active      boolean default true,
  created_at  timestamptz default now()
);
alter table public.coupons enable row level security;
drop policy if exists "Admins can manage coupons" on public.coupons;
create policy "Admins can manage coupons" on public.coupons for all
  using (public.is_admin());

-- ── 11. Reviews ────────────────────────────────────────────────
create table if not exists public.reviews (
  id                 uuid primary key default gen_random_uuid(),
  product_id         text references public.products(id) on delete cascade,
  user_id            uuid references auth.users(id) on delete set null,
  customer_name      text not null,
  customer_location  text,
  rating             int not null check (rating between 1 and 5),
  title              text,
  body               text not null,
  published          boolean default false,
  created_at         timestamptz default now()
);
alter table public.reviews enable row level security;
drop policy if exists "Anyone can read published reviews" on public.reviews;
drop policy if exists "Users can write reviews"           on public.reviews;
drop policy if exists "Admins can manage all reviews"     on public.reviews;
create policy "Anyone can read published reviews" on public.reviews for select using (published = true);
create policy "Users can write reviews"           on public.reviews for insert with check (auth.uid() = user_id);
create policy "Admins can manage all reviews"     on public.reviews for all
  using (public.is_admin());

-- ── 12. Testimonials ───────────────────────────────────────────
create table if not exists public.testimonials (
  id           text primary key,
  name         text not null,
  location     text,
  rating       int default 5,
  body         text not null,
  avatar       text,
  product_name text,
  published    boolean default true,
  sort_order   int default 0
);
alter table public.testimonials enable row level security;
drop policy if exists "Anyone can read published testimonials" on public.testimonials;
drop policy if exists "Admins can manage testimonials"         on public.testimonials;
create policy "Anyone can read published testimonials" on public.testimonials for select using (published = true);
create policy "Admins can manage testimonials"         on public.testimonials for all
  using (public.is_admin());

-- ── 13. Settings ───────────────────────────────────────────────
create table if not exists public.settings (
  id                  text primary key default 'global',
  store_name          text default 'PrintYourVibe',
  support_email       text default 'hello@printyourvibe.co.uk',
  support_phone       text default '+44 20 0000 0000',
  std_shipping        numeric(10,2) default 3.99,
  express_shipping    numeric(10,2) default 7.99,
  free_threshold      numeric(10,2) default 50.00,
  watermark_text      text default 'PrintYourVibe.co.uk',
  notification_events jsonb default '["New order placed","Order dispatched","Refund issued"]'
);
alter table public.settings enable row level security;
drop policy if exists "Admins can manage settings" on public.settings;
create policy "Admins can manage settings" on public.settings for all
  using (public.is_admin());

-- ── 14. RPC Helpers ────────────────────────────────────────────
create or replace function public.increment_coupon_use(code text)
returns void language plpgsql security definer as $$
begin
  update public.coupons set used_count = used_count + 1 where coupons.code = increment_coupon_use.code;
end;
$$;

create or replace function public.next_order_number()
returns text language plpgsql security definer as $$
declare
  today  text := to_char(now(), 'YYYYMMDD');
  seq    int;
  result text;
begin
  select count(*) + 1 into seq from public.orders where created_at::date = current_date;
  result := 'PYV-' || today || '-' || lpad(seq::text, 4, '0');
  return result;
end;
$$;

-- =============================================================
-- SEED DATA
-- =============================================================
-- Storage base: https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/

-- Categories
insert into public.categories (id, name, slug, description, image_url, sort_order) values
  ('cat-1','T-Shirts',   't-shirts',   'Premium quality custom printed t-shirts',  'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-black.png',   1),
  ('cat-2','Hoodies',    'hoodies',    'Heavyweight fleece custom printed hoodies', 'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black.png',   2),
  ('cat-3','Sweatshirts','sweatshirts','Classic crewneck sweatshirts',              'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy.png',    3),
  ('cat-4','Tote Bags',  'tote-bags',  'Heavy canvas custom printed tote bags',    'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/totebag-natural.png',4)
on conflict (id) do update set name=excluded.name, image_url=excluded.image_url, sort_order=excluded.sort_order;

-- Products
insert into public.products (id,category_id,name,slug,description,base_price,compare_price,rating,review_count,is_featured,print_area) values
  ('prod-1','cat-1','Classic Premium Tee','classic-premium-tee',
   'Our bestselling 100% ring-spun cotton t-shirt. Pre-shrunk, soft, and built to last.',
   19.99,29.99,4.8,247,true,'{"front":{"x":120,"y":90,"w":260,"h":280},"back":{"x":120,"y":90,"w":260,"h":280}}'::jsonb),
  ('prod-2','cat-1','Relaxed Fit Tee','relaxed-fit-tee',
   'A slightly oversized, relaxed fit tee perfect for streetwear aesthetics.',
   22.99,null,4.6,89,true,'{"front":{"x":115,"y":95,"w":270,"h":290},"back":{"x":115,"y":95,"w":270,"h":290}}'::jsonb),
  ('prod-3','cat-2','Heavyweight Pullover Hoodie','heavyweight-pullover-hoodie',
   '380gsm fleece pullover hoodie with a double-lined hood and kangaroo pocket.',
   42.99,55.99,4.9,312,true,'{"front":{"x":130,"y":110,"w":240,"h":240},"back":{"x":130,"y":90,"w":240,"h":260}}'::jsonb),
  ('prod-4','cat-2','Zip-Up Hoodie','zip-up-hoodie',
   'Premium zip-up hoodie in 320gsm cotton-polyester blend.',
   46.99,null,4.7,156,false,'{"front":{"x":80,"y":100,"w":180,"h":220},"back":{"x":130,"y":90,"w":240,"h":260}}'::jsonb),
  ('prod-5','cat-3','Classic Crewneck Sweatshirt','classic-crewneck-sweatshirt',
   '280gsm medium-weight crewneck sweatshirt with ribbed collar, cuffs and hem.',
   34.99,42.99,4.7,198,true,'{"front":{"x":125,"y":95,"w":250,"h":250},"back":{"x":125,"y":85,"w":250,"h":270}}'::jsonb),
  ('prod-6','cat-4','Heavy Canvas Tote Bag','heavy-canvas-tote-bag',
   '12oz heavyweight natural canvas tote bag with reinforced stitching.',
   14.99,null,4.5,74,true,'{"front":{"x":100,"y":100,"w":300,"h":300},"back":{"x":100,"y":100,"w":300,"h":300}}'::jsonb)
on conflict (id) do update set
  name=excluded.name, slug=excluded.slug, description=excluded.description,
  base_price=excluded.base_price, compare_price=excluded.compare_price,
  rating=excluded.rating, review_count=excluded.review_count,
  is_featured=excluded.is_featured, print_area=excluded.print_area;

-- Product Colours
insert into public.product_colours (id,product_id,name,hex,mockup_front_url,mockup_back_url,sort_order) values
  ('c1-1','prod-1','Jet Black',    '#1a1a1a',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-black.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-black-back.png',1),
  ('c1-2','prod-1','Pure White',   '#f5f5f5',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-white.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-white-back.png',2),
  ('c1-3','prod-1','Deep Burgundy','#6b1a2a',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-burgundy.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-burgundy-back.png',3),
  ('c2-1','prod-2','Pure White',   '#f5f5f5',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-white.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-white-back.png',1),
  ('c2-2','prod-2','Jet Black',    '#1a1a1a',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-black.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-black-back.png',2),
  ('c3-1','prod-3','Jet Black',    '#1a1a1a',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black-back.png',1),
  ('c3-2','prod-3','Navy Blue',    '#1f2d4e',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy-back.png',2),
  ('c4-1','prod-4','Navy Blue',    '#1f2d4e',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy-back.png',1),
  ('c4-2','prod-4','Jet Black',    '#1a1a1a',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black-back.png',2),
  ('c5-1','prod-5','Navy Blue',    '#1f2d4e',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy-back.png',1),
  ('c5-2','prod-5','Jet Black',    '#1a1a1a',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black-back.png',2),
  ('c6-1','prod-6','Natural',      '#d4c5a9',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/totebag-natural.png',
   'https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/totebag-natural-back.png',1)
on conflict (id) do update set
  name=excluded.name, hex=excluded.hex,
  mockup_front_url=excluded.mockup_front_url, mockup_back_url=excluded.mockup_back_url;

-- Product Sizes (delete+insert is safe since cascades from products)
delete from public.product_sizes;
insert into public.product_sizes (product_id,label,price_modifier,sort_order) values
  ('prod-1','XS',0,1),('prod-1','S',0,2),('prod-1','M',0,3),('prod-1','L',0,4),('prod-1','XL',2,5),('prod-1','XXL',2,6),
  ('prod-2','S',0,1),('prod-2','M',0,2),('prod-2','L',0,3),('prod-2','XL',2,4),('prod-2','XXL',2,5),
  ('prod-3','S',0,1),('prod-3','M',0,2),('prod-3','L',0,3),('prod-3','XL',3,4),('prod-3','XXL',3,5),
  ('prod-4','S',0,1),('prod-4','M',0,2),('prod-4','L',0,3),('prod-4','XL',3,4),
  ('prod-5','XS',0,1),('prod-5','S',0,2),('prod-5','M',0,3),('prod-5','L',0,4),('prod-5','XL',2,5),('prod-5','XXL',2,6),
  ('prod-6','One Size',0,1);

-- Product Gallery (delete+insert)
delete from public.product_gallery;
insert into public.product_gallery (product_id,url,sort_order) values
  ('prod-1','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-black.png',1),
  ('prod-1','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-white.png',2),
  ('prod-1','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-burgundy.png',3),
  ('prod-2','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-white.png',1),
  ('prod-2','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/tshirt-black.png',2),
  ('prod-3','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black.png',1),
  ('prod-3','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy.png',2),
  ('prod-4','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy.png',1),
  ('prod-4','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black.png',2),
  ('prod-5','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-navy.png',1),
  ('prod-5','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/hoodie-black.png',2),
  ('prod-6','https://bwwoatnpscsbftjzjhny.supabase.co/storage/v1/object/public/product-images/totebag-natural.png',1);

-- Testimonials
insert into public.testimonials (id,name,location,rating,body,avatar,product_name,sort_order) values
  ('t1','Sophie W.','Manchester',5,'Absolutely blown away by the quality. My design came out crisp and vibrant — exactly as it looked in the mockup tool.','SW','Classic Premium Tee',1),
  ('t2','James R.','London',5,'The mockup tool is so easy to use. The final hoodie looks incredible. Fast delivery too — arrived in 3 days.','JR','Heavyweight Pullover Hoodie',2),
  ('t3','Priya M.','Birmingham',5,'Ordered 20 custom tees for our event. Every single one was perfect. The colours are rich and the fabric is soft.','PM','Classic Premium Tee',3),
  ('t4','Tom A.','Leeds',4,'The sweatshirt quality is premium and the print didn''t crack or fade after multiple washes. Great value.','TA','Classic Crewneck Sweatshirt',4),
  ('t5','Chloe B.','Edinburgh',5,'Used PrintYourVibe for my small business merchandise. The tote bags are beautiful.','CB','Heavy Canvas Tote Bag',5)
on conflict (id) do update set name=excluded.name, body=excluded.body, sort_order=excluded.sort_order;

-- Coupons
insert into public.coupons (code,type,value,min_order,max_uses,used_count,expires_at,active) values
  ('PYV10','percent',10,0,null,0,null,true),
  ('SAVE5','fixed',5,25,100,0,'2026-12-31 23:59:59+00',true),
  ('LAUNCH','percent',20,0,50,0,'2026-06-01 23:59:59+00',false)
on conflict (code) do nothing;

-- Settings
insert into public.settings (id,store_name,support_email,support_phone,std_shipping,express_shipping,free_threshold,watermark_text)
values ('global','PrintYourVibe','hello@printyourvibe.co.uk','+44 20 0000 0000',3.99,7.99,50.00,'PrintYourVibe.co.uk')
on conflict (id) do update set
  store_name=excluded.store_name, support_email=excluded.support_email,
  std_shipping=excluded.std_shipping, express_shipping=excluded.express_shipping,
  free_threshold=excluded.free_threshold;

-- Reviews
insert into public.reviews (product_id,customer_name,customer_location,rating,title,body,published) values
  ('prod-1','Priya M.','Birmingham',4,'Great for business merch','Ordered 20 for our team. Every one was perfect.',true),
  ('prod-6','Chloe B.','Edinburgh',5,'Perfect for my small business','My customers love them. Beautiful print quality.',true),
  ('prod-3','James R.','London',5,'Best hoodie I''ve owned','My custom design came out exactly as it looked in the mockup tool.',true);
