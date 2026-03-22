-- RPC 함수에서 orders.product_name/category 참조를 products JOIN으로 교체

-- 1. 카테고리별 판매량: orders.category → products.category
CREATE OR REPLACE FUNCTION get_category_data()
RETURNS TABLE(name TEXT, value BIGINT)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_seller_id UUID := auth.uid();
BEGIN
  RETURN QUERY
    SELECT
      p.category AS name,
      COUNT(*)::BIGINT AS value
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.seller_id = v_seller_id
      AND o.deleted_at IS NULL
    GROUP BY p.category
    ORDER BY value DESC;
END;
$$;

-- 2. 카테고리별 매출: orders.category → products.category
DROP FUNCTION IF EXISTS get_analytics_category(INT);
CREATE OR REPLACE FUNCTION get_analytics_category(p_days INT)
RETURNS TABLE (
  name    TEXT,
  revenue NUMERIC(12,2)
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_seller_id UUID := auth.uid();
BEGIN
  RETURN QUERY
    SELECT
      p.category AS name,
      SUM(o.total_price)::NUMERIC(12,2) AS revenue
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.ordered_at >= NOW() - (p_days || ' days')::INTERVAL
      AND o.status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
      AND o.seller_id = v_seller_id
      AND o.deleted_at IS NULL
    GROUP BY p.category
    ORDER BY revenue DESC;
END;
$$;

-- 3. 상품별 매출 순위: o.product_name/category → p.name/category
DROP FUNCTION IF EXISTS get_analytics_top_products(INT, INT);
CREATE OR REPLACE FUNCTION get_analytics_top_products(p_days INT, p_limit INT DEFAULT 10)
RETURNS TABLE (
  rank         BIGINT,
  product_name TEXT,
  category     TEXT,
  quantity     BIGINT,
  revenue      NUMERIC(12,2)
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_seller_id UUID := auth.uid();
BEGIN
  RETURN QUERY
    SELECT
      ROW_NUMBER() OVER (ORDER BY SUM(o.total_price) DESC) AS rank,
      p.name AS product_name,
      p.category,
      SUM(o.quantity)::BIGINT           AS quantity,
      SUM(o.total_price)::NUMERIC(12,2) AS revenue
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.ordered_at >= NOW() - (p_days || ' days')::INTERVAL
      AND o.status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
      AND o.seller_id = v_seller_id
      AND o.deleted_at IS NULL
    GROUP BY p.name, p.category
    ORDER BY revenue DESC
    LIMIT p_limit;
END;
$$;
