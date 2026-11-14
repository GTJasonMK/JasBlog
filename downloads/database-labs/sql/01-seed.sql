\set ON_ERROR_STOP on

BEGIN;
INSERT INTO shop.customers(email, display_name) VALUES
    ('zhang@example.invalid', '张同学'),
    ('li@example.invalid', '李同学'),
    ('wang@example.invalid', '王同学');

INSERT INTO shop.products(sku, name, price_cents, stock) VALUES
    ('KEYBOARD-001', '机械键盘', 19900, 97),
    ('MOUSE-001', '鼠标', 9900, 49),
    ('MONITOR-001', '显示器', 159900, 0);

INSERT INTO shop.orders
    (customer_id, request_key, request_fingerprint, status, total_cents, created_at)
VALUES
    (1, 'seed-1', '1:2', 'paid', 39800, '2026-01-10 10:00:00+00'),
    (1, 'seed-2', '2:1', 'pending', 9900, '2026-01-10 11:00:00+00'),
    (2, 'seed-3', '1:1', 'paid', 19900, '2026-01-11 10:00:00+00');

INSERT INTO shop.order_items(order_id, product_id, quantity, unit_price_cents)
VALUES (1, 1, 2, 19900), (2, 2, 1, 9900), (3, 1, 1, 19900);

INSERT INTO shop.payments(order_id, provider_ref, amount_cents, status) VALUES
    (1, 'provider-failed-1', 39800, 'failed'),
    (1, 'provider-success-1', 39800, 'succeeded'),
    (3, 'provider-success-3', 19900, 'succeeded');

INSERT INTO shop.stock_movements(product_id, order_id, delta, reason) VALUES
    (1, NULL, 100, 'opening'), (2, NULL, 50, 'opening'),
    (1, 1, -2, 'order'), (2, 2, -1, 'order'), (1, 3, -1, 'order');

INSERT INTO shop.outbox(order_id, event_type, payload)
SELECT id, 'order.created', jsonb_build_object('order_id', id)
FROM shop.orders;
COMMIT;
