-- 감사 필드 추가: created_by, updated_by
-- 누가 데이터를 생성/수정했는지 추적하기 위한 필드

-- 1. orders 테이블
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 2. products 테이블
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 3. sellers 테이블
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 4. INSERT 시 created_by 자동 설정 트리거
CREATE OR REPLACE FUNCTION set_audit_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_orders_audit_insert
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_audit_created_by();

CREATE TRIGGER trg_products_audit_insert
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION set_audit_created_by();

CREATE TRIGGER trg_sellers_audit_insert
  BEFORE INSERT ON sellers
  FOR EACH ROW EXECUTE FUNCTION set_audit_created_by();

-- 5. UPDATE 시 updated_by 자동 설정 트리거
CREATE OR REPLACE FUNCTION set_audit_updated_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_orders_audit_update
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_audit_updated_by();

CREATE TRIGGER trg_products_audit_update
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_audit_updated_by();

CREATE TRIGGER trg_sellers_audit_update
  BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION set_audit_updated_by();
