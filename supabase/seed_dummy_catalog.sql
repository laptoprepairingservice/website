-- ============================================================================
-- SEED DUMMY CATALOG DATA (BRANDS, CATEGORIES, PRODUCTS, VARIANTS, INVENTORY)
-- ============================================================================

-- 1. FIX CIRCULAR CATEGORY PARENT_IDS
UPDATE public.categories SET parent_id = NULL WHERE id IN (1, 3);

-- 2. SEED BRANDS
INSERT INTO public.brands (name, slug, description, sort_order, is_active)
VALUES
  ('DELL', 'dell', 'Dell Inspiron, Latitude, XPS, and Vostro parts and accessories', 1, true),
  ('HP', 'hp', 'HP Pavilion, Envy, EliteBook, and Omen replacement parts', 2, true),
  ('Lenovo', 'lenovo', 'ThinkPad, IdeaPad and Legion laptops and spare parts', 3, true),
  ('Apple', 'apple', 'MacBook Pro, MacBook Air and iMac genuine and OEM replacement parts', 4, true),
  ('ASUS', 'asus', 'ROG, TUF and ZenBook replacement components and accessories', 5, true),
  ('Acer', 'acer', 'Aspire, Predator and Nitro laptop parts and accessories', 6, true),
  ('Samsung', 'samsung', 'Original Samsung memory, NVMe SSDs and displays', 7, true),
  ('Crucial', 'crucial', 'Industry standard Micron/Crucial memory and SSD upgrades', 8, true)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = EXCLUDED.is_active;

-- 3. SEED CATEGORIES
INSERT INTO public.categories (name, slug, description, image_path, sort_order, is_active)
VALUES
  ('Charger', 'charger', 'Fast-charging AC power adapters and chargers for all laptops', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80', 1, true),
  ('Cool pad', 'name-is-this', 'Laptop cooling pads and stands', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 2, true),
  ('keyboard', 'keyboard', 'Original and OEM replacement laptop keyboards and touchpads', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 3, true),
  ('Screens & Displays', 'screens-displays', 'Replacement LCD, LED and OLED screens for all major laptop brands', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 4, true),
  ('Batteries', 'batteries', 'High capacity OEM & replacement laptop batteries', 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=800&q=80', 5, true),
  ('RAM & Memory', 'ram-memory', 'High performance DDR4 and DDR5 SO-DIMM laptop RAM', 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80', 6, true),
  ('SSDs & Storage', 'ssds-storage', 'Ultra-fast M.2 NVMe and SATA solid state drives', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80', 7, true),
  ('Cooling Fans & Thermal', 'cooling-fans', 'OEM replacement CPU/GPU cooling fans and thermal modules', 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80', 8, true),
  ('Motherboards & Components', 'motherboards-components', 'Laptop motherboards, DC power jacks and internal daughterboards', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 9, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, image_path = EXCLUDED.image_path, is_active = EXCLUDED.is_active;
