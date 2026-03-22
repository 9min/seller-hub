-- RPC 함수 반환 타입을 NUMERIC(12,2)으로 변경
-- 가격 필드가 NUMERIC으로 변경되었으므로 집계 결과도 NUMERIC으로 반환

-- RETURNS TABLE 시그니처가 변경되므로 기존 함수를 DROP 후 재생성

-- 1. get_sales_data: revenue BIGINT → NUMERIC(12,2)
DROP FUNCTION IF EXISTS get_sales_data(TEXT);
CREATE OR REPLACE FUNCTION get_sales_data(p_period TEXT DEFAULT 'daily')
RETURNS TABLE(label TEXT, revenue NUMERIC(12,2))
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_seller_id UUID := auth.uid();
BEGIN
  IF p_period = 'monthly' THEN
    RETURN QUERY
      SELECT
        TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM월') AS label,
        SUM(total_price)::NUMERIC(12,2)                   AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - INTERVAL '12 months'
        AND seller_id = v_seller_id
        AND deleted_at IS NULL
      GROUP BY DATE_TRUNC('month', ordered_at),
               TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM월')
      ORDER BY DATE_TRUNC('month', ordered_at);

  ELSIF p_period = 'weekly' THEN
    RETURN QUERY
      SELECT
        TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM월 ')
          || CEIL(EXTRACT(DAY FROM ordered_at AT TIME ZONE 'UTC') / 7.0)::TEXT
          || '주'                                          AS label,
        SUM(total_price)::NUMERIC(12,2)                   AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - INTERVAL '12 weeks'
        AND seller_id = v_seller_id
        AND deleted_at IS NULL
      GROUP BY DATE_TRUNC('week', ordered_at),
               TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM월 ')
                 || CEIL(EXTRACT(DAY FROM ordered_at AT TIME ZONE 'UTC') / 7.0)::TEXT
                 || '주'
      ORDER BY DATE_TRUNC('week', ordered_at);

  ELSE
    RETURN QUERY
      SELECT
        TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM/FMDD') AS label,
        SUM(total_price)::NUMERIC(12,2)                      AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - INTERVAL '30 days'
        AND seller_id = v_seller_id
        AND deleted_at IS NULL
      GROUP BY DATE_TRUNC('day', ordered_at),
               TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM/FMDD')
      ORDER BY DATE_TRUNC('day', ordered_at);
  END IF;
END;
$$;

-- 2. get_analytics_summary: total_revenue BIGINT → NUMERIC(12,2)
DROP FUNCTION IF EXISTS get_analytics_summary(INT);
CREATE OR REPLACE FUNCTION get_analytics_summary(p_days INT)
RETURNS TABLE (
  total_revenue       NUMERIC(12,2),
  total_orders        BIGINT,
  avg_unit_price      NUMERIC,
  revenue_growth_rate NUMERIC
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_seller_id UUID := auth.uid();
BEGIN
  RETURN QUERY
    WITH
      current_period AS (
        SELECT
          COALESCE(SUM(total_price), 0)::NUMERIC(12,2) AS revenue,
          COUNT(*)::BIGINT                              AS orders,
          COALESCE(AVG(unit_price), 0)                  AS avg_price
        FROM orders
        WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
          AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
          AND seller_id = v_seller_id
          AND deleted_at IS NULL
      ),
      prev_period AS (
        SELECT COALESCE(SUM(total_price), 0)::NUMERIC(12,2) AS revenue
        FROM orders
        WHERE ordered_at >= NOW() - (p_days * 2 || ' days')::INTERVAL
          AND ordered_at <  NOW() - (p_days || ' days')::INTERVAL
          AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
          AND seller_id = v_seller_id
          AND deleted_at IS NULL
      )
    SELECT
      c.revenue,
      c.orders,
      ROUND(c.avg_price, 0),
      CASE
        WHEN p.revenue = 0 THEN 0
        ELSE ROUND(((c.revenue - p.revenue)::NUMERIC / p.revenue) * 100, 1)
      END
    FROM current_period c, prev_period p;
END;
$$;

-- 3. get_analytics_trend: current_revenue/previous_revenue BIGINT → NUMERIC(12,2)
DROP FUNCTION IF EXISTS get_analytics_trend(INT);
CREATE OR REPLACE FUNCTION get_analytics_trend(p_days INT)
RETURNS TABLE (
  day_index        INT,
  label            TEXT,
  current_revenue  NUMERIC(12,2),
  previous_revenue NUMERIC(12,2)
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_seller_id UUID := auth.uid();
BEGIN
  RETURN QUERY
    WITH
      days AS (
        SELECT generate_series(1, p_days) AS idx
      ),
      current_period AS (
        SELECT
          p_days - EXTRACT(DAY FROM (NOW() - ordered_at))::INT AS idx,
          SUM(total_price)::NUMERIC(12,2) AS revenue
        FROM orders
        WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
          AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
          AND seller_id = v_seller_id
          AND deleted_at IS NULL
        GROUP BY idx
      ),
      prev_period AS (
        SELECT
          p_days - EXTRACT(DAY FROM (NOW() - (p_days || ' days')::INTERVAL - ordered_at))::INT AS idx,
          SUM(total_price)::NUMERIC(12,2) AS revenue
        FROM orders
        WHERE ordered_at >= NOW() - (p_days * 2 || ' days')::INTERVAL
          AND ordered_at <  NOW() - (p_days || ' days')::INTERVAL
          AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
          AND seller_id = v_seller_id
          AND deleted_at IS NULL
        GROUP BY idx
      )
    SELECT
      d.idx,
      TO_CHAR(NOW() - ((p_days - d.idx) || ' days')::INTERVAL, 'MM/DD') AS label,
      COALESCE(c.revenue, 0)::NUMERIC(12,2),
      COALESCE(p.revenue, 0)::NUMERIC(12,2)
    FROM days d
    LEFT JOIN current_period c ON c.idx = d.idx
    LEFT JOIN prev_period    p ON p.idx = d.idx
    ORDER BY d.idx;
END;
$$;

-- 4. get_analytics_category: revenue BIGINT → NUMERIC(12,2)
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
      category AS name,
      SUM(total_price)::NUMERIC(12,2) AS revenue
    FROM orders
    WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
      AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
      AND seller_id = v_seller_id
      AND deleted_at IS NULL
    GROUP BY category
    ORDER BY revenue DESC;
END;
$$;

-- 5. get_analytics_top_products: revenue BIGINT → NUMERIC(12,2)
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
      ROW_NUMBER() OVER (ORDER BY SUM(total_price) DESC) AS rank,
      o.product_name,
      o.category,
      SUM(o.quantity)::BIGINT           AS quantity,
      SUM(o.total_price)::NUMERIC(12,2) AS revenue
    FROM orders o
    WHERE o.ordered_at >= NOW() - (p_days || ' days')::INTERVAL
      AND o.status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
      AND o.seller_id = v_seller_id
      AND o.deleted_at IS NULL
    GROUP BY o.product_name, o.category
    ORDER BY revenue DESC
    LIMIT p_limit;
END;
$$;
