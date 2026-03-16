-- products 테이블 생성
CREATE TABLE IF NOT EXISTS products (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  unit_price  INT         NOT NULL CHECK (unit_price >= 0),
  stock       INT         NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sales_count INT         NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
  status      TEXT        NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('ACTIVE', 'SOLD_OUT', 'HIDDEN')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_products_status   ON products (status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_name     ON products USING GIN (to_tsvector('simple', name));

-- updated_at 자동 갱신 트리거 (orders 테이블의 함수 재사용)
CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 개발/데모 단계: anon 읽기 허용
CREATE POLICY anon_read_products ON products
  FOR SELECT TO anon USING (true);
CREATE POLICY auth_read_products ON products
  FOR SELECT TO authenticated USING (true);
