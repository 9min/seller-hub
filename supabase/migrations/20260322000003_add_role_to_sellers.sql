-- sellers 테이블에 role 컬럼 추가 (기본값: 'seller')
ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'seller'
  CHECK (role IN ('admin', 'seller', 'viewer'));
