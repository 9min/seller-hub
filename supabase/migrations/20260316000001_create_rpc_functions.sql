-- KPI 4개 집계 함수
CREATE OR REPLACE FUNCTION get_kpi_metrics()
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_result JSON;
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

-- 일/주/월 매출 집계 함수
CREATE OR REPLACE FUNCTION get_sales_data(p_period TEXT DEFAULT 'daily')
RETURNS TABLE(label TEXT, revenue BIGINT)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF p_period = 'monthly' THEN
    RETURN QUERY
      SELECT
        TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM월') AS label,
        SUM(total_price)::BIGINT                          AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - INTERVAL '12 months'
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
      GROUP BY DATE_TRUNC('week', ordered_at),
               TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM월 ')
                 || CEIL(EXTRACT(DAY FROM ordered_at AT TIME ZONE 'UTC') / 7.0)::TEXT
                 || '주'
      ORDER BY DATE_TRUNC('week', ordered_at);

  ELSE
    -- daily (기본값)
    RETURN QUERY
      SELECT
        TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM/FMDD') AS label,
        SUM(total_price)::BIGINT                             AS revenue
      FROM orders
      WHERE ordered_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', ordered_at),
               TO_CHAR(ordered_at AT TIME ZONE 'UTC', 'FMMM/FMDD')
      ORDER BY DATE_TRUNC('day', ordered_at);
  END IF;
END;
$$;

-- 카테고리별 판매량 집계 함수
CREATE OR REPLACE FUNCTION get_category_data()
RETURNS TABLE(name TEXT, value BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    category   AS name,
    COUNT(*)::BIGINT AS value
  FROM orders
  GROUP BY category
  ORDER BY value DESC;
$$;
