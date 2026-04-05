-- =============================================================
-- PrintYourVibe — Migration 002: Content Blocks
-- Supabase CLI: supabase db push
-- Purpose: Makes landing page content editable from admin panel
-- =============================================================

create table if not exists public.content_blocks (
  id          text primary key,
  section     text not null check (section in ('how_it_works', 'trust_bar')),
  sort_order  int default 0,
  icon        text,
  title       text,
  description text,
  active      boolean default true,
  updated_at  timestamptz default now()
);

alter table public.content_blocks enable row level security;

drop policy if exists "Anyone can read active content blocks" on public.content_blocks;
drop policy if exists "Admins can manage content blocks"       on public.content_blocks;

create policy "Anyone can read active content blocks"
  on public.content_blocks for select using (active = true);

create policy "Admins can manage content blocks"
  on public.content_blocks for all
  using (public.is_admin());

drop trigger if exists update_content_blocks_updated_at on public.content_blocks;
create trigger update_content_blocks_updated_at before update on public.content_blocks
  for each row execute function public.update_updated_at_column();

-- Seed: How It Works steps
insert into public.content_blocks (id, section, sort_order, icon, title, description) values
  ('hiw-1', 'how_it_works', 1, '01', 'Choose a Product',
   'Browse our range of premium garments and accessories. Pick your style, colour, and size.'),
  ('hiw-2', 'how_it_works', 2, '02', 'Upload Your Design',
   'Drop your artwork onto our live 2D mockup tool. Drag, scale, and rotate until it''s perfect.'),
  ('hiw-3', 'how_it_works', 3, '03', 'We Print & Deliver',
   'We produce your order with professional DTG printing and deliver straight to your door.')
on conflict (id) do nothing;

-- Seed: Trust Bar items
insert into public.content_blocks (id, section, sort_order, icon, title) values
  ('trust-1', 'trust_bar', 1, '🇬🇧', 'UK Printed'),
  ('trust-2', 'trust_bar', 2, '↩️',  'Free Returns'),
  ('trust-3', 'trust_bar', 3, '🔒', 'Secure Checkout'),
  ('trust-4', 'trust_bar', 4, '🚚', 'Fast Dispatch')
on conflict (id) do nothing;
