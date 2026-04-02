-- ============================================================
-- PrintYourVibe — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ── Categories ─────────────────────────────────────────────────
insert into public.categories (id, name, slug, description, image_url, sort_order) values
  ('cat-1', 'T-Shirts',    't-shirts',    'Premium quality custom printed t-shirts',        '/products/tshirt-black.png',    1),
  ('cat-2', 'Hoodies',     'hoodies',     'Heavyweight fleece custom printed hoodies',      '/products/hoodie-black.png',    2),
  ('cat-3', 'Sweatshirts', 'sweatshirts', 'Classic crewneck sweatshirts',                   '/products/hoodie-navy.png',     3),
  ('cat-4', 'Tote Bags',   'tote-bags',   'Heavy canvas custom printed tote bags',          '/products/totebag-natural.png', 4)
on conflict (id) do nothing;


-- ── Products ───────────────────────────────────────────────────
insert into public.products (id, category_id, name, slug, description, base_price, compare_price, rating, review_count, is_featured, print_area) values
  ('prod-1', 'cat-1', 'Classic Premium Tee', 'classic-premium-tee',
   'Our bestselling 100% ring-spun cotton t-shirt. Pre-shrunk, soft, and built to last. The perfect canvas for your designs. Available in a range of colours with vibrant DTG printing.',
   19.99, 29.99, 4.8, 247, true,
   '{"front":{"x":120,"y":90,"w":260,"h":280},"back":{"x":120,"y":90,"w":260,"h":280}}'::jsonb),

  ('prod-2', 'cat-1', 'Relaxed Fit Tee', 'relaxed-fit-tee',
   'A slightly oversized, relaxed fit tee perfect for streetwear aesthetics. Made from heavyweight 200gsm cotton with a brushed interior for extra softness.',
   22.99, null, 4.6, 89, true,
   '{"front":{"x":115,"y":95,"w":270,"h":290},"back":{"x":115,"y":95,"w":270,"h":290}}'::jsonb),

  ('prod-3', 'cat-2', 'Heavyweight Pullover Hoodie', 'heavyweight-pullover-hoodie',
   '380gsm fleece pullover hoodie with a double-lined hood and kangaroo pocket. Built for cold weather and bold statements. DTG and embroidery compatible.',
   42.99, 55.99, 4.9, 312, true,
   '{"front":{"x":130,"y":110,"w":240,"h":240},"back":{"x":130,"y":90,"w":240,"h":260}}'::jsonb),

  ('prod-4', 'cat-2', 'Zip-Up Hoodie', 'zip-up-hoodie',
   'Premium zip-up hoodie in 320gsm cotton-polyester blend. Full-length metal zipper, side pockets, and a relaxed athletic fit. Great for left-chest and full-back prints.',
   46.99, null, 4.7, 156, false,
   '{"front":{"x":80,"y":100,"w":180,"h":220},"back":{"x":130,"y":90,"w":240,"h":260}}'::jsonb),

  ('prod-5', 'cat-3', 'Classic Crewneck Sweatshirt', 'classic-crewneck-sweatshirt',
   '280gsm medium-weight crewneck sweatshirt. Ribbed collar, cuffs and hem. Versatile everyday piece with outstanding print quality on the front chest and full back.',
   34.99, 42.99, 4.7, 198, true,
   '{"front":{"x":125,"y":95,"w":250,"h":250},"back":{"x":125,"y":85,"w":250,"h":270}}'::jsonb),

  ('prod-6', 'cat-4', 'Heavy Canvas Tote Bag', 'heavy-canvas-tote-bag',
   '12oz heavyweight natural canvas tote bag. Long carry handles, reinforced stitching and a wide base. Perfect for vibrant prints that last wash after wash.',
   14.99, null, 4.5, 74, true,
   '{"front":{"x":100,"y":100,"w":300,"h":300},"back":{"x":100,"y":100,"w":300,"h":300}}'::jsonb)
on conflict (id) do nothing;


-- ── Product Colours ────────────────────────────────────────────
insert into public.product_colours (id, product_id, name, hex, mockup_front_url, mockup_back_url, sort_order) values
  -- Classic Premium Tee
  ('c1-1', 'prod-1', 'Jet Black',     '#1a1a1a', '/products/tshirt-black.png',    '/products/tshirt-black-back.png',    1),
  ('c1-2', 'prod-1', 'Pure White',    '#f5f5f5', '/products/tshirt-white.png',    '/products/tshirt-white-back.png',    2),
  ('c1-3', 'prod-1', 'Deep Burgundy', '#6b1a2a', '/products/tshirt-burgundy.png', '/products/tshirt-burgundy-back.png', 3),
  -- Relaxed Fit Tee
  ('c2-1', 'prod-2', 'Pure White', '#f5f5f5', '/products/tshirt-white.png', '/products/tshirt-white-back.png', 1),
  ('c2-2', 'prod-2', 'Jet Black',  '#1a1a1a', '/products/tshirt-black.png', '/products/tshirt-black-back.png', 2),
  -- Heavyweight Pullover Hoodie
  ('c3-1', 'prod-3', 'Jet Black', '#1a1a1a', '/products/hoodie-black.png', '/products/hoodie-black-back.png', 1),
  ('c3-2', 'prod-3', 'Navy Blue', '#1f2d4e', '/products/hoodie-navy.png',  '/products/hoodie-navy-back.png',  2),
  -- Zip-Up Hoodie
  ('c4-1', 'prod-4', 'Navy Blue', '#1f2d4e', '/products/hoodie-navy.png',  '/products/hoodie-navy-back.png',  1),
  ('c4-2', 'prod-4', 'Jet Black', '#1a1a1a', '/products/hoodie-black.png', '/products/hoodie-black-back.png', 2),
  -- Classic Crewneck Sweatshirt
  ('c5-1', 'prod-5', 'Navy Blue', '#1f2d4e', '/products/hoodie-navy.png',  '/products/hoodie-navy-back.png',  1),
  ('c5-2', 'prod-5', 'Jet Black', '#1a1a1a', '/products/hoodie-black.png', '/products/hoodie-black-back.png', 2),
  -- Heavy Canvas Tote Bag
  ('c6-1', 'prod-6', 'Natural', '#d4c5a9', '/products/totebag-natural.png', '/products/totebag-natural-back.png', 1)
on conflict (id) do nothing;


-- ── Product Sizes ──────────────────────────────────────────────
insert into public.product_sizes (product_id, label, price_modifier, sort_order) values
  ('prod-1', 'XS',  0, 1), ('prod-1', 'S',  0, 2), ('prod-1', 'M', 0, 3),
  ('prod-1', 'L',   0, 4), ('prod-1', 'XL', 2, 5), ('prod-1', 'XXL', 2, 6),
  ('prod-2', 'S',   0, 1), ('prod-2', 'M',  0, 2), ('prod-2', 'L',  0, 3),
  ('prod-2', 'XL',  2, 4), ('prod-2', 'XXL', 2, 5),
  ('prod-3', 'S',   0, 1), ('prod-3', 'M',  0, 2), ('prod-3', 'L',  0, 3),
  ('prod-3', 'XL',  3, 4), ('prod-3', 'XXL', 3, 5),
  ('prod-4', 'S',   0, 1), ('prod-4', 'M',  0, 2), ('prod-4', 'L',  0, 3),
  ('prod-4', 'XL',  3, 4),
  ('prod-5', 'XS',  0, 1), ('prod-5', 'S',  0, 2), ('prod-5', 'M',  0, 3),
  ('prod-5', 'L',   0, 4), ('prod-5', 'XL', 2, 5), ('prod-5', 'XXL', 2, 6),
  ('prod-6', 'One Size', 0, 1);


-- ── Product Gallery ────────────────────────────────────────────
insert into public.product_gallery (product_id, url, sort_order) values
  ('prod-1', '/products/tshirt-black.png',    1),
  ('prod-1', '/products/tshirt-white.png',    2),
  ('prod-1', '/products/tshirt-burgundy.png', 3),
  ('prod-2', '/products/tshirt-white.png',    1),
  ('prod-2', '/products/tshirt-black.png',    2),
  ('prod-3', '/products/hoodie-black.png',    1),
  ('prod-3', '/products/hoodie-navy.png',     2),
  ('prod-4', '/products/hoodie-navy.png',     1),
  ('prod-4', '/products/hoodie-black.png',    2),
  ('prod-5', '/products/hoodie-navy.png',     1),
  ('prod-5', '/products/hoodie-black.png',    2),
  ('prod-6', '/products/totebag-natural.png', 1);


-- ── Testimonials ───────────────────────────────────────────────
insert into public.testimonials (id, name, location, rating, body, avatar, product_name, sort_order) values
  ('t1', 'Sophie W.', 'Manchester', 5,
   'Absolutely blown away by the quality. My design came out crisp and vibrant — exactly as it looked in the mockup tool. Will definitely be ordering again.',
   'SW', 'Classic Premium Tee', 1),
  ('t2', 'James R.', 'London', 5,
   'The mockup tool is so easy to use. I uploaded my artwork, arranged it, and the final hoodie looks incredible. Fast delivery too — arrived in 3 days.',
   'JR', 'Heavyweight Pullover Hoodie', 2),
  ('t3', 'Priya M.', 'Birmingham', 5,
   'Ordered 20 custom tees for our event. Every single one was perfect. The colours are rich and the fabric is soft. Our team loved them.',
   'PM', 'Classic Premium Tee', 3),
  ('t4', 'Tom A.', 'Leeds', 4,
   'Really impressed with the service. The sweatshirt quality is premium and the print didn''t crack or fade after multiple washes. Great value.',
   'TA', 'Classic Crewneck Sweatshirt', 4),
  ('t5', 'Chloe B.', 'Edinburgh', 5,
   'Used PrintYourVibe for my small business merchandise. The tote bags are beautiful and my customers keep asking where I got them. 10/10.',
   'CB', 'Heavy Canvas Tote Bag', 5)
on conflict (id) do nothing;


-- ── Coupons ────────────────────────────────────────────────────
insert into public.coupons (code, type, value, min_order, max_uses, used_count, expires_at, active) values
  ('PYV10',  'percent', 10, 0,  null, 45, null,                    true),
  ('SAVE5',  'fixed',   5,  25, 100,  23, '2026-06-30 23:59:59+00', true),
  ('LAUNCH', 'percent', 20, 0,  50,   50, '2026-03-01 23:59:59+00', false)
on conflict (code) do nothing;


-- ── Site Settings (default row) ────────────────────────────────
insert into public.settings (id, store_name, support_email, support_phone, std_shipping, express_shipping, free_threshold, watermark_text)
values ('global', 'PrintYourVibe', 'hello@printyourvibe.co.uk', '+44 20 0000 0000', 3.99, 7.99, 50.00, 'PrintYourVibe.co.uk')
on conflict (id) do nothing;


-- ── Reviews (pre-seeded sample, published) ─────────────────────
insert into public.reviews (product_id, customer_name, customer_location, rating, title, body, published) values
  ('prod-1', 'Priya M.', 'Birmingham', 4, 'Great for business merch',
   'Ordered 20 for our team. Every one was perfect. The only reason for 4 stars is the delivery took slightly longer than expected.', true),
  ('prod-6', 'Chloe B.', 'Edinburgh',  5, 'Perfect for my small business',
   'My customers love them. Beautiful print quality and the bags are sturdy.', true),
  ('prod-5', 'Tom A.',   'Leeds',      4, 'Great quality, fast dispatch',
   'Print hasn''t faded after several washes. Very impressed.', false),
  ('prod-1', 'Sophie W.','Manchester', 5, 'Absolutely amazing quality',
   'Blown away by the print quality. Colours are vibrant and the fabric is super soft. Will definitely order again!', false),
  ('prod-3', 'James R.', 'London',     5, 'Best hoodie I''ve owned',
   'The weight is perfect, not too heavy. My custom design came out exactly as it looked in the mockup tool.', false);
