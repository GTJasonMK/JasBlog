\set ON_ERROR_STOP on

BEGIN;
DO $$
DECLARE
    v_id bigint;
    v_repeat bigint;
    v_stock integer;
    v_count bigint;
BEGIN
    SELECT stock INTO STRICT v_stock FROM shop.products WHERE id = 1;
    SELECT count(*) INTO v_count FROM shop.orders;
    v_id := shop.place_order(1, 1, 2, 'self-check-order');
    v_repeat := shop.place_order(1, 1, 2, 'self-check-order');
    IF v_id <> v_repeat
       OR (SELECT stock FROM shop.products WHERE id = 1) <> v_stock - 2
       OR (SELECT count(*) FROM shop.orders) <> v_count + 1
       OR (SELECT total_cents FROM shop.orders WHERE id = v_id) <> 39800
       OR (SELECT count(*) FROM shop.outbox WHERE order_id = v_id) <> 1
       OR (SELECT sum(delta) FROM shop.stock_movements WHERE order_id = v_id) <> -2 THEN
        RAISE EXCEPTION '下单、幂等或流水断言失败';
    END IF;

    BEGIN
        PERFORM shop.place_order(1, 1, 3, 'self-check-order');
        RAISE EXCEPTION '应拒绝不同内容复用请求键';
    EXCEPTION WHEN invalid_parameter_value THEN
        NULL; -- 只接收本例预期的 22023，其他错误继续传播。
    END;
    BEGIN
        PERFORM shop.place_order(1, 3, 1, 'self-check-shortage');
        RAISE EXCEPTION '应拒绝无库存商品' USING ERRCODE = 'XX000';
    EXCEPTION WHEN raise_exception THEN
        NULL;
    END;
    BEGIN
        PERFORM shop.place_order(1, 1, 0, 'self-check-invalid');
        RAISE EXCEPTION '应拒绝零数量';
    EXCEPTION WHEN invalid_parameter_value THEN
        NULL;
    END;
    BEGIN
        PERFORM shop.place_order(NULL, 1, 1, 'self-check-null');
        RAISE EXCEPTION '应拒绝空客户';
    EXCEPTION WHEN invalid_parameter_value THEN
        NULL;
    END;
    IF EXISTS (SELECT 1 FROM shop.orders WHERE request_key IN
        ('self-check-shortage', 'self-check-invalid', 'self-check-null')) THEN
        RAISE EXCEPTION '失败操作遗留了订单';
    END IF;
END $$;
ROLLBACK;
SELECT 'order checks passed; business changes rolled back' AS result;
