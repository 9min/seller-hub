-- orders 테이블에 product_id FK 추가 및 데이터 마이그레이션
-- product_name TEXT → product_id UUID FK로 정규화

-- 1. product_id 컬럼 추가 (nullable — 기존 데이터 호환)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);

CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);

-- 2. 데이터 마이그레이션: 동일 seller_id + product name으로 매핑
UPDATE orders o
SET product_id = p.id
FROM products p
WHERE o.product_name = p.name
  AND o.seller_id = p.seller_id
  AND o.product_id IS NULL;

-- 3. seller_id 없는 레거시 데이터는 이름만으로 매칭 (DISTINCT ON으로 1:1 보장)
UPDATE orders o
SET product_id = sub.pid
FROM (
  SELECT DISTINCT ON (p.name) p.name, p.id AS pid
  FROM products p
) sub
WHERE o.product_name = sub.name
  AND o.product_id IS NULL;
