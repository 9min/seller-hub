-- RPC 함수에 deleted_at IS NULL 조건 추가
-- STABLE 함수가 RLS를 바이패스할 수 있으므로 명시적 필터 적용

-- 1. KPI 집계 함수
CREATE OR REPLACE FUNCTION get_kpi_metrics()
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_result JSON;
  v_seller_id UUID := auth.uid();
BEGIN
  WITH
    now_30 AS (
      SELECT
        COALESCE(SUM(total_price), 0)                                                         AS revenue,
        COUNT(*) FILTER (WHERE status = 'PAYMENT_COMPLETE')                                   AS new_orders,
        COUNT(*) FILTER (WHERE is_delayed = TRUE)                                             AS delayed,
        COUNT(*) FILTER (WHERE status IN ('RETURN_REQUESTED', 'EXCHANGE_REQUESTED'))          AS return_exchange,
        COUNT(*)                                                                               AS total
      FROM orders
      WHERE ordered_at >= NOW() - INTERVAL '30 days'
        AND seller_id = v_seller_id
        AND deleted_at IS NULL
    ),
    prev_30 AS (
      SELECT
        COALESCE(SUM(total_price), 0)                                                         AS revenue,
        COUNT(*) FILTER (WHERE status = 'PAYMENT_COMPLETE')                                   AS new_orders,
        COUNT(*) FILTER (WHERE is_delayed = TRUE)                                             AS delayed,
        COUNT(*) FILTER (WHERE status IN ('RETURN_REQUESTED', 'EXCHANGE_REQUESTED'))          AS return_exchange,
        COUNT(*)                                                                               AS total
      FROM orders
      WHERE ordered_at >= NOW() - INTERVAL '60 days'
        AND ordered_at <  NOW() - INTERVAL '30 days'
        AND seller_id = v_seller_id
        AND deleted_at IS NULL
    )
  SELECT JSON_BUILD_ARRAY(
    JSON_BUILD_OBJECT(
      'id',         'total_revenue',
      'label',      '총 매출',
      'value',      n.revenue,
      'changeRate', CASE
                      WHEN p.revenue = 0 THEN 0
                      ELSE ROUND(((n.revenue - p.revenue)::NUMERIC / p.revenue * 100)::NUMERIC, 1)
                    END,
      'unit',       '원'
    ),
    JSON_BUILD_OBJECT(
      'id',         'new_orders',
      'label',      '신규 주문',
      'value',      n.new_orders,
      'changeRate', CASE
                      WHEN p.new_orders = 0 THEN 0
                      ELSE ROUND(((n.new_orders - p.new_orders)::NUMERIC / p.new_orders * 100)::NUMERIC, 1)
                    END,
      'unit',       '건'
    ),
    JSON_BUILD_OBJECT(
      'id',         'delayed',
      'label',      '배송 지연',
      'value',      n.delayed,
      'changeRate', CASE
                      WHEN p.delayed = 0 THEN 0
                      ELSE ROUND(((n.delayed - p.delayed)::NUMERIC / p.delayed * 100)::NUMERIC, 1)
                    END,
      'unit',       '건'
    ),
    JSON_BUILD_OBJECT(
      'id',         'return_rate',
      'label',      '반품/교환율',
      'value',      CASE WHEN n.total = 0 THEN 0
                         ELSE ROUND((n.return_exchange::NUMERIC / n.total * 100)::NUMERIC, 1)
                    END,
      'changeRate', CASE
                      WHEN p.total = 0 THEN 0
                      ELSE ROUND((
                        (CASE WHEN n.total = 0 THEN 0 ELSE n.return_exchange::NUMERIC / n.total * 100 END) -
                        (CASE WHEN p.total = 0 THEN 0 ELSE p.return_exchange::NUMERIC / p.total * 100 END)
                      )::NUMERIC, 1)
                    END,
      'unit',       '%'
    )
  ) INTO v_result
  FROM now_30 n, prev_30 p;

  RETURN v_result;
END;
$$;

-- 2. 일/주/월 매출 집계 함수
CREATE OR REPLACE FUNCTION get_sales_data(p_period TEXT DEFAULT 'daily')
RETURNS TABLE(label TEXT, revenue BIGINT)
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
        SUM(total_price)::BIGINT                          AS revenue
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
        SUM(total_price)::BIGINT                          AS revenue
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
        SUM(total_price)::BIGINT                             AS revenue
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

-- 3. 카테고리별 판매량 집계 함수
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
      category   AS name,
      COUNT(*)::BIGINT AS value
    FROM orders
    WHERE seller_id = v_seller_id
      AND deleted_at IS NULL
    GROUP BY category
    ORDER BY value DESC;
END;
$$;

-- 4. 매출 분석 요약
CREATE OR REPLACE FUNCTION get_analytics_summary(p_days INT)
RETURNS TABLE (
  total_revenue      BIGINT,
  total_orders       BIGINT,
  avg_unit_price     NUMERIC,
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
          COALESCE(SUM(total_price), 0)::BIGINT   AS revenue,
          COUNT(*)::BIGINT                          AS orders,
          COALESCE(AVG(unit_price), 0)              AS avg_price
        FROM orders
        WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
          AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
          AND seller_id = v_seller_id
          AND deleted_at IS NULL
      ),
      prev_period AS (
        SELECT COALESCE(SUM(total_price), 0)::BIGINT AS revenue
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

-- 5. 기간별 매출 추이
CREATE OR REPLACE FUNCTION get_analytics_trend(p_days INT)
RETURNS TABLE (
  day_index        INT,
  label            TEXT,
  current_revenue  BIGINT,
  previous_revenue BIGINT
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
          SUM(total_price)::BIGINT AS revenue
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
          SUM(total_price)::BIGINT AS revenue
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
      COALESCE(c.revenue, 0),
      COALESCE(p.revenue, 0)
    FROM days d
    LEFT JOIN current_period c ON c.idx = d.idx
    LEFT JOIN prev_period    p ON p.idx = d.idx
    ORDER BY d.idx;
END;
$$;

-- 6. 카테고리별 매출
CREATE OR REPLACE FUNCTION get_analytics_category(p_days INT)
RETURNS TABLE (
  name    TEXT,
  revenue BIGINT
)
LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_seller_id UUID := auth.uid();
BEGIN
  RETURN QUERY
    SELECT
      category AS name,
      SUM(total_price)::BIGINT AS revenue
    FROM orders
    WHERE ordered_at >= NOW() - (p_days || ' days')::INTERVAL
      AND status NOT IN ('CANCELLED', 'RETURN_REQUESTED')
      AND seller_id = v_seller_id
      AND deleted_at IS NULL
    GROUP BY category
    ORDER BY revenue DESC;
END;
$$;

-- 7. 상품별 매출 순위
CREATE OR REPLACE FUNCTION get_analytics_top_products(p_days INT, p_limit INT DEFAULT 10)
RETURNS TABLE (
  rank         BIGINT,
  product_name TEXT,
  category     TEXT,
  quantity     BIGINT,
  revenue      BIGINT
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
      SUM(o.quantity)::BIGINT    AS quantity,
      SUM(o.total_price)::BIGINT AS revenue
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
