-- 기존 공개 정책 삭제
DROP POLICY IF EXISTS "anon_read_orders" ON orders;
DROP POLICY IF EXISTS anon_read_products ON products;
DROP POLICY IF EXISTS auth_read_products ON products;

-- orders: seller 기반 정책
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seller_select_orders' AND tablename = 'orders') THEN
    CREATE POLICY seller_select_orders ON orders FOR SELECT TO authenticated USING (seller_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seller_insert_orders' AND tablename = 'orders') THEN
    CREATE POLICY seller_insert_orders ON orders FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seller_update_orders' AND tablename = 'orders') THEN
    CREATE POLICY seller_update_orders ON orders FOR UPDATE TO authenticated USING (seller_id = auth.uid());
  END IF;
END $$;

-- products: seller 기반 정책
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seller_select_products' AND tablename = 'products') THEN
    CREATE POLICY seller_select_products ON products FOR SELECT TO authenticated USING (seller_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seller_insert_products' AND tablename = 'products') THEN
    CREATE POLICY seller_insert_products ON products FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seller_update_products' AND tablename = 'products') THEN
    CREATE POLICY seller_update_products ON products FOR UPDATE TO authenticated USING (seller_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'seller_delete_products' AND tablename = 'products') THEN
    CREATE POLICY seller_delete_products ON products FOR DELETE TO authenticated USING (seller_id = auth.uid());
  END IF;
END $$;
