-- 가격 필드 INT → NUMERIC(12,2) 변환
-- 소수점 금액 처리를 위해 정밀도 확보

-- orders 테이블
ALTER TABLE orders
  ALTER COLUMN unit_price TYPE NUMERIC(12,2) USING unit_price::NUMERIC(12,2),
  ALTER COLUMN total_price TYPE NUMERIC(12,2) USING total_price::NUMERIC(12,2);

-- products 테이블
ALTER TABLE products
  ALTER COLUMN unit_price TYPE NUMERIC(12,2) USING unit_price::NUMERIC(12,2);

-- CHECK 제약 조건 재적용
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_unit_price_check;
ALTER TABLE products ADD CONSTRAINT products_unit_price_check CHECK (unit_price >= 0);
