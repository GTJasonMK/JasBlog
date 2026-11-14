\set ON_ERROR_STOP on
\timing on

-- 独立练习表，不扩大业务种子数据；重复实验前按实验手册清理此表。
CREATE TABLE practice.orders_perf (
    id bigint PRIMARY KEY,
    customer_id bigint NOT NULL,
    status text NOT NULL,
    total_cents bigint NOT NULL,
    created_at timestamptz NOT NULL
);
INSERT INTO practice.orders_perf
SELECT n, n % 1000 + 1,
       CASE WHEN n % 4 = 0 THEN 'pending' ELSE 'paid' END,
       100 + n % 100000,
       timestamptz '2026-01-01 00:00:00+00' + n * interval '1 minute'
FROM generate_series(1, 200000) AS g(n);
ANALYZE practice.orders_perf;

EXPLAIN (ANALYZE, BUFFERS, SETTINGS)
SELECT id, created_at, total_cents FROM practice.orders_perf
WHERE customer_id = 42 AND status = 'paid'
ORDER BY created_at DESC, id DESC LIMIT 20;

CREATE INDEX orders_perf_customer_status_time_idx
ON practice.orders_perf(customer_id, status, created_at DESC, id DESC)
INCLUDE (total_cents);
ANALYZE practice.orders_perf;

EXPLAIN (ANALYZE, BUFFERS, SETTINGS)
SELECT id, created_at, total_cents FROM practice.orders_perf
WHERE customer_id = 42 AND status = 'paid'
ORDER BY created_at DESC, id DESC LIMIT 20;

DO $$
BEGIN
    IF (SELECT count(*) FROM practice.orders_perf) <> 200000
       OR (SELECT count(*) FROM practice.orders_perf
           WHERE customer_id = 42 AND status = 'paid') <> 200 THEN
        RAISE EXCEPTION '性能实验数据不完整';
    END IF;
END $$;
