-- 매출 분석 페이지 전용 RPC 함수

-- 1. 요약 지표: 이번 기간 vs 이전 기간 비교
CREATE OR REPLACE FUNCTION get_analytics_summary(p_days INT)
RETURNS TABLE (
  total_revenue      BIGINT,
  total_orders       BIGINT,
  avg_unit_price     NUMERIC,
  revenue_growth_rate NUMERIC
)
LANGUAGE sql STABLE AS $$
  WITH
    current_period AS (
      SELECT
        COALESCE(SUM(total_price), 0)::BIGINT   AS revenue,
        COUNT(*)::BIGINT                          AS orders,
        COALESCE(AVG(unit_price), 0)              AS avg_price
      FROM orders
      WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
        AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
    ),
    prev_period AS (
      SELECT COALESCE(SUM(total_price), 0)::BIGINT AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - (p_days * 2 || ' days')::INTERVAL
        AND ordered_at <  NOW() - (p_days || ' days')::INTERVAL
        AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
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
$$;

-- 2. 기간별 매출 추이: 이번 기간 + 이전 기간 비교
CREATE OR REPLACE FUNCTION get_analytics_trend(p_days INT)
RETURNS TABLE (
  day_index        INT,
  label            TEXT,
  current_revenue  BIGINT,
  previous_revenue BIGINT
)
LANGUAGE sql STABLE AS $$
  WITH
    days AS (
      SELECT generate_series(1, p_days) AS idx
    ),
    current_period AS (
      SELECT
        p_days - EXTRACT(DAY FROM (NOW() - ordered_at))::INT AS idx,
        SUM(total_price)::BIGINT AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
        AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
      GROUP BY idx
    ),
    prev_period AS (
      SELECT
        p_days - EXTRACT(DAY FROM (NOW() - (p_days || ' days')::INTERVAL - ordered_at))::INT AS idx,
        SUM(total_price)::BIGINT AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - (p_days * 2 || ' days')::INTERVAL
        AND ordered_at <  NOW() - (p_days || ' days')::INTERVAL
        AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
      GROUP BY idx
    )
  SELECT
    d.idx,
    TO_CHAR(NOW() - ((p_days - d.idx) || ' days')::INTERVAL, 'MM/DD') AS label,
    COALESCE(c.revenue, 0),
    COALESCE(p.revenue, 0)
  FROM days d
  LEFT JOIN current_period c ON c.idx = d.idx
  LEFT JOIN prev_period    p ON p.idx = d.idx
  ORDER BY d.idx;
$$;

-- 3. 카테고리별 매출
CREATE OR REPLACE FUNCTION get_analytics_category(p_days INT)
RETURNS TABLE (
  name    TEXT,
  revenue BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT
    category AS name,
    SUM(total_price)::BIGINT AS revenue
  FROM orders
  WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
    AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
  GROUP BY category
  ORDER BY revenue DESC;
$$;

-- 4. 상품별 매출 순위 (Top N)
CREATE OR REPLACE FUNCTION get_analytics_top_products(p_days INT, p_limit INT DEFAULT 10)
RETURNS TABLE (
  rank         BIGINT,
  product_name TEXT,
  category     TEXT,
  quantity     BIGINT,
  revenue      BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(total_price) DESC) AS rank,
    product_name,
    category,
    SUM(quantity)::BIGINT    AS quantity,
    SUM(total_price)::BIGINT AS revenue
  FROM orders
  WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
    AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
  GROUP BY product_name, category
  ORDER BY revenue DESC
  LIMIT p_limit;
$$;
