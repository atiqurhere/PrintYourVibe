-- ============================================================
-- PrintYourVibe — Complete Supabase Schema
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- ── 1. Profiles (extends auth.users) ─────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

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
exception
  when others then
    -- Catch any errors so OAuth signups still succeed even if profile creation fails
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. Categories ──────────────────────────────────────────────
create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  slug        text unique not null,
  description text,
  image_url   text,
  sort_order  int default 0
);

alter table public.categories enable row level security;
create policy "Anyone can read categories" on public.categories for select using (true);
create policy "Admins can manage categories" on public.categories for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 3. Products ────────────────────────────────────────────────
create table if not exists public.products (
  id              text primary key,
  category_id     text references public.categories(id) on delete set null,
  name            text not null,
  slug            text unique not null,
  description     text,
  base_price      numeric(10,2) not null,
  compare_price   numeric(10,2),
  rating          numeric(3,1) default 0,
  review_count    int default 0,
  is_featured     boolean default false,
  print_area      jsonb,  -- {front:{x,y,w,h}, back:{x,y,w,h}}
  active          boolean default true,
  created_at      timestamptz default now()
);

alter table public.products enable row level security;
create policy "Anyone can read active products" on public.products for select using (active = true);
create policy "Admins can manage products" on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 4. Product Colours ─────────────────────────────────────────
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
create policy "Anyone can read product colours" on public.product_colours for select using (true);
create policy "Admins can manage product colours" on public.product_colours for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 5. Product Sizes ───────────────────────────────────────────
create table if not exists public.product_sizes (
  id              uuid primary key default gen_random_uuid(),
  product_id      text references public.products(id) on delete cascade,
  label           text not null,
  price_modifier  numeric(10,2) default 0,
  sort_order      int default 0
);

alter table public.product_sizes enable row level security;
create policy "Anyone can read product sizes" on public.product_sizes for select using (true);
create policy "Admins can manage product sizes" on public.product_sizes for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 6. Product Gallery ─────────────────────────────────────────
create table if not exists public.product_gallery (
  id          uuid primary key default gen_random_uuid(),
  product_id  text references public.products(id) on delete cascade,
  url         text not null,
  sort_order  int default 0
);

alter table public.product_gallery enable row level security;
create policy "Anyone can read gallery" on public.product_gallery for select using (true);
create policy "Admins can manage gallery" on public.product_gallery for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 7. Orders ──────────────────────────────────────────────────
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  number              text unique not null,  -- e.g. PYV-12349
  status              text not null default 'pending'
                      check (status in ('pending','confirmed','printing','dispatched','delivered','cancelled','refunded')),
  subtotal_pence      int not null default 0,
  shipping_pence      int not null default 0,
  discount_pence      int not null default 0,
  total_pence         int not null,
  coupon_code         text,
  stripe_session_id   text,
  stripe_payment_intent text,
  items               jsonb not null default '[]',
  tracking            jsonb,            -- {carrier, number, url}
  history             jsonb default '[]', -- [{status, note, by, at}]
  shipping_name       text,
  shipping_email      text,
  shipping_address    jsonb,            -- {line1, city, postcode, country}
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select using (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on public.orders for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger orders_updated_at before update on public.orders
  for each row execute procedure public.set_updated_at();


-- ── 8. Reviews ─────────────────────────────────────────────────
create table if not exists public.reviews (
  id                uuid primary key default gen_random_uuid(),
  product_id        text references public.products(id) on delete cascade,
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  customer_location text,
  rating            int not null check (rating between 1 and 5),
  title             text,
  body              text not null,
  published         boolean default false,
  created_at        timestamptz default now()
);

alter table public.reviews enable row level security;
create policy "Anyone can read published reviews" on public.reviews for select using (published = true);
create policy "Users can write reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Admins can manage all reviews" on public.reviews for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 9. Coupons ─────────────────────────────────────────────────
create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  type        text not null check (type in ('percent', 'fixed')),
  value       numeric(10,2) not null,
  min_order   numeric(10,2) default 0,
  max_uses    int,
  used_count  int default 0,
  expires_at  timestamptz,
  active      boolean default true,
  created_at  timestamptz default now()
);

alter table public.coupons enable row level security;
-- Public can only validate (by code lookup) — full management is admin only
create policy "Admins can manage coupons" on public.coupons for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 10. Testimonials ───────────────────────────────────────────
create table if not exists public.testimonials (
  id           text primary key,
  name         text not null,
  location     text,
  rating       int not null check (rating between 1 and 5),
  body         text not null,
  avatar       text,
  product_name text,
  sort_order   int default 0,
  published    boolean default true
);

alter table public.testimonials enable row level security;
create policy "Anyone can read published testimonials" on public.testimonials for select using (published = true);
create policy "Admins can manage testimonials" on public.testimonials for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── 11. Settings ───────────────────────────────────────────────
create table if not exists public.settings (
  id                    text primary key default 'global',
  store_name            text default 'PrintYourVibe',
  support_email         text default 'hello@printyourvibe.co.uk',
  support_phone         text default '+44 20 0000 0000',
  std_shipping          numeric(10,2) default 3.99,
  express_shipping      numeric(10,2) default 7.99,
  free_threshold        numeric(10,2) default 50.00,
  watermark_text        text default 'PrintYourVibe.co.uk',
  notification_events   jsonb default '["New order placed","Order dispatched","Refund issued"]'
);

alter table public.settings enable row level security;
create policy "Admins can manage settings" on public.settings for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ── Grant admin (run once, replace UUID with your user ID) ─────
-- update public.profiles set role = 'admin' where id = '<your-uuid>';
-- update auth.users
--   set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
--   where id = '<your-uuid>';


-- ── RLS: Users can read their own orders ────────────────────────
-- (In addition to admin policy already set)
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id OR user_id IS NULL);


-- ── increment_coupon_use RPC function ───────────────────────────
-- Called by the Stripe webhook to safely increment used_count
create or replace function public.increment_coupon_use(code text)
returns void language plpgsql security definer as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where coupons.code = increment_coupon_use.code;
end;
$$;


-- ── generate_order_number helper (optional, used if generating server-side) ──
create or replace function public.next_order_number()
returns text language plpgsql security definer as $$
declare
  today text := to_char(now(), 'YYYYMMDD');
  seq   int;
  result text;
begin
  select count(*) + 1 into seq
  from public.orders
  where created_at::date = current_date;
  result := 'PYV-' || today || '-' || lpad(seq::text, 4, '0');
  return result;
end;
$$;
