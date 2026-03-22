-- 1. sellers 테이블 생성 (auth.users와 1:1 매핑)
CREATE TABLE IF NOT EXISTS sellers (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- sellers updated_at 자동 갱신 트리거
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sellers_updated_at'
  ) THEN
    CREATE TRIGGER trg_sellers_updated_at
      BEFORE UPDATE ON sellers
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- 2. sellers 행은 프론트엔드 signUp에서 직접 생성 (authStore.ts 참조)
-- auth.users 트리거 방식은 클라우드 환경에서 권한 문제가 발생할 수 있어 제거함
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. orders 테이블에 seller_id 추가 (nullable — 기존 데이터 호환)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);

CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);

-- 4. products 테이블에 seller_id 추가 (nullable — 기존 데이터 호환)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);

-- 5. sellers 테이블 RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'seller_select_own' AND tablename = 'sellers'
  ) THEN
    CREATE POLICY seller_select_own ON sellers
      FOR SELECT TO authenticated USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'seller_update_own' AND tablename = 'sellers'
  ) THEN
    CREATE POLICY seller_update_own ON sellers
      FOR UPDATE TO authenticated USING (id = auth.uid());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'seller_insert_own' AND tablename = 'sellers'
  ) THEN
    CREATE POLICY seller_insert_own ON sellers
      FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
  END IF;
END $$;
