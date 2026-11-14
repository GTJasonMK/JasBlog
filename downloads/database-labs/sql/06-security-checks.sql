\set ON_ERROR_STOP on

BEGIN;
CREATE ROLE shop_reader NOLOGIN;
CREATE VIEW shop.customer_directory AS
    SELECT id, display_name FROM shop.customers;
GRANT CONNECT ON DATABASE db_lab TO shop_reader;
GRANT USAGE ON SCHEMA shop TO shop_reader;
GRANT SELECT ON shop.products, shop.orders, shop.order_items,
    shop.customer_directory TO shop_reader;
COMMIT;

BEGIN;
SET LOCAL ROLE shop_reader;
SELECT current_user, count(*) AS visible_orders FROM shop.orders;
SELECT * FROM shop.customer_directory ORDER BY id;
DO $$
BEGIN
    BEGIN
        UPDATE shop.products SET stock = stock WHERE id = 1;
        RAISE EXCEPTION '只读角色竟然可以修改商品';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;
    BEGIN
        PERFORM email FROM shop.customers;
        RAISE EXCEPTION '只读角色竟然可以读取客户原表';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;
    BEGIN
        CREATE TABLE shop.forbidden_table (id integer);
        RAISE EXCEPTION '只读角色竟然可以创建业务表';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;
END $$;
ROLLBACK;
SELECT 'security checks passed' AS result;
