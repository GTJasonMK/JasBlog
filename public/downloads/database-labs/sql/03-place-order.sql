\set ON_ERROR_STOP on

-- shortcut: 只处理单商品下单，加入优惠、多商品或退款时先扩展业务不变量与测试。
CREATE FUNCTION shop.place_order(
    p_customer_id bigint,
    p_product_id bigint,
    p_quantity integer,
    p_request_key text
) RETURNS bigint
LANGUAGE plpgsql
SET search_path = pg_catalog, shop
AS $$
DECLARE
    v_order_id bigint;
    v_existing_fingerprint text;
    v_fingerprint text;
    v_price bigint;
BEGIN
    IF p_customer_id IS NULL OR p_customer_id <= 0
       OR p_product_id IS NULL OR p_product_id <= 0
       OR p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 1000
       OR p_request_key IS NULL OR length(p_request_key) NOT BETWEEN 1 AND 128 THEN
        RAISE EXCEPTION '客户、商品、数量或请求键不合法' USING ERRCODE = '22023';
    END IF;
    v_fingerprint := p_product_id::text || ':' || p_quantity::text;

    INSERT INTO shop.orders
        (customer_id, request_key, request_fingerprint, status, total_cents)
    VALUES (p_customer_id, p_request_key, v_fingerprint, 'pending', 0)
    ON CONFLICT (customer_id, request_key) DO NOTHING
    RETURNING id INTO v_order_id;

    IF v_order_id IS NULL THEN
        SELECT id, request_fingerprint INTO v_order_id, v_existing_fingerprint
        FROM shop.orders
        WHERE customer_id = p_customer_id AND request_key = p_request_key;
        IF NOT FOUND THEN
            RAISE EXCEPTION '当前快照未包含冲突订单，请重试整个事务'
                USING ERRCODE = '40001';
        END IF;
        IF v_existing_fingerprint <> v_fingerprint THEN
            RAISE EXCEPTION '同一请求键对应了不同请求内容' USING ERRCODE = '22023';
        END IF;
        RETURN v_order_id;
    END IF;

    UPDATE shop.products
    SET stock = stock - p_quantity, updated_at = now()
    WHERE id = p_product_id AND stock >= p_quantity
    RETURNING price_cents INTO v_price;
    IF NOT FOUND THEN
        RAISE EXCEPTION '商品不存在或库存不足' USING ERRCODE = 'P0001';
    END IF;

    INSERT INTO shop.order_items(order_id, product_id, quantity, unit_price_cents)
    VALUES (v_order_id, p_product_id, p_quantity, v_price);
    UPDATE shop.orders SET total_cents = v_price * p_quantity WHERE id = v_order_id;
    INSERT INTO shop.stock_movements(product_id, order_id, delta, reason)
    VALUES (p_product_id, v_order_id, -p_quantity, 'order');
    INSERT INTO shop.outbox(order_id, event_type, payload)
    VALUES (v_order_id, 'order.created', jsonb_build_object('order_id', v_order_id));
    RETURN v_order_id;
END $$;

REVOKE ALL ON FUNCTION shop.place_order(bigint, bigint, integer, text) FROM PUBLIC;
