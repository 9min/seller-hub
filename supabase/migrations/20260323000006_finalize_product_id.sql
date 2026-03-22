-- product_name, category 컬럼 제거 (product_id FK로 대체)
-- product 정보는 products 테이블에서 JOIN으로 조회

-- 기존 인덱스 제거
DROP INDEX IF EXISTS idx_orders_category;

-- 레거시 컬럼 제거
ALTER TABLE orders DROP COLUMN IF EXISTS product_name;
ALTER TABLE orders DROP COLUMN IF EXISTS category;
