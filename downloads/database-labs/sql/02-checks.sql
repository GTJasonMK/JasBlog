\set ON_ERROR_STOP on

-- 在新建或完整逻辑恢复的课程数据库运行，基线数据应当未被提交修改。
DO $$
BEGIN
    IF (SELECT count(*) FROM shop.customers) <> 3
       OR (SELECT count(*) FROM shop.products) <> 3
       OR (SELECT count(*) FROM shop.orders) <> 3
       OR (SELECT count(*) FROM shop.order_items) <> 3
       OR (SELECT count(*) FROM shop.payments) <> 3
       OR (SELECT count(*) FROM shop.stock_movements) <> 5
       OR (SELECT count(*) FROM shop.outbox) <> 3 THEN
        RAISE EXCEPTION '基线行数不符，请核对是否已经提交过修改';
    END IF;
    IF (SELECT sum(total_cents) FROM shop.orders WHERE status = 'paid')
       IS DISTINCT FROM 59700 THEN
        RAISE EXCEPTION '已支付订单金额应为 59700 分';
    END IF;
    IF EXISTS (
        SELECT 1 FROM shop.products p
        LEFT JOIN (
            SELECT product_id, sum(delta) AS balance
            FROM shop.stock_movements GROUP BY product_id
        ) m ON m.product_id = p.id
        WHERE p.stock <> coalesce(m.balance, 0)
    ) THEN
        RAISE EXCEPTION '库存与流水不一致';
    END IF;
    IF EXISTS (
        SELECT 1 FROM shop.orders o
        LEFT JOIN (
            SELECT order_id, sum(line_total_cents) AS amount
            FROM shop.order_items GROUP BY order_id
        ) i ON i.order_id = o.id
        WHERE o.total_cents <> coalesce(i.amount, 0)
    ) THEN
        RAISE EXCEPTION '订单与明细金额不一致';
    END IF;
    IF EXISTS (
        SELECT 1 FROM shop.orders o
        LEFT JOIN shop.payments p ON p.order_id = o.id AND p.status = 'succeeded'
        WHERE o.status = 'paid'
        GROUP BY o.id, o.total_cents
        HAVING coalesce(sum(p.amount_cents), 0) <> o.total_cents
    ) THEN
        RAISE EXCEPTION '已支付订单与成功支付金额不一致';
    END IF;
END $$;
SELECT 'baseline checks passed' AS result;
