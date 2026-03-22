-- 소프트 딜리트: deleted_at 컬럼 추가 + RLS 정책 교체
-- 물리 삭제 대신 deleted_at 타임스탬프를 설정하여 논리 삭제 처리

-- 1. deleted_at 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. 부분 인덱스 (삭제되지 않은 행 필터링 최적화)
CREATE INDEX IF NOT EXISTS idx_orders_not_deleted ON orders(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_not_deleted ON products(deleted_at) WHERE deleted_at IS NULL;

-- 3. orders RLS 정책 교체: deleted_at IS NULL 조건 추가
DROP POLICY IF EXISTS seller_select_orders ON orders;
DROP POLICY IF EXISTS seller_update_orders ON orders;

CREATE POLICY seller_select_orders ON orders
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY seller_update_orders ON orders
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() AND deleted_at IS NULL);

-- 4. products RLS 정책 교체: deleted_at IS NULL 조건 추가
DROP POLICY IF EXISTS seller_select_products ON products;
DROP POLICY IF EXISTS seller_update_products ON products;
DROP POLICY IF EXISTS seller_delete_products ON products;

CREATE POLICY seller_select_products ON products
  FOR SELECT TO authenticated
  USING (seller_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY seller_update_products ON products
  FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() AND deleted_at IS NULL);

-- DELETE 정책 제거: soft delete 사용하므로 물리 삭제 불허
-- seller_delete_products 는 이미 DROP 됨
