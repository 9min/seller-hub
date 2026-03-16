-- 주문 테이블 생성
CREATE TABLE orders (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number   TEXT        NOT NULL UNIQUE,
  buyer_name     TEXT        NOT NULL,
  product_name   TEXT        NOT NULL,
  category       TEXT        NOT NULL,
  quantity       INT         NOT NULL,
  unit_price     INT         NOT NULL,
  total_price    INT         NOT NULL,
  status         TEXT        NOT NULL,
  ordered_at     TIMESTAMPTZ NOT NULL,
  shipped_at     TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  is_delayed     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 검색·필터 인덱스
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_ordered_at   ON orders(ordered_at);
CREATE INDEX idx_orders_category     ON orders(category);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- RLS (v0.2: anon read 허용 / v1.0에서 seller 기반으로 교체)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_orders" ON orders FOR SELECT USING (true);
