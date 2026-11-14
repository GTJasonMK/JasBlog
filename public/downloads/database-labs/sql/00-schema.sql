\set ON_ERROR_STOP on

BEGIN;
CREATE SCHEMA shop;
CREATE SCHEMA practice;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
CREATE EXTENSION pg_stat_statements;

CREATE TABLE shop.customers (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email text NOT NULL UNIQUE,
    display_name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shop.products (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku text NOT NULL UNIQUE,
    name text NOT NULL,
    price_cents bigint NOT NULL CHECK (price_cents BETWEEN 1 AND 100000000),
    stock integer NOT NULL CHECK (stock >= 0),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE shop.orders (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id bigint NOT NULL REFERENCES shop.customers(id),
    request_key text NOT NULL CHECK (length(request_key) BETWEEN 1 AND 128),
    request_fingerprint text NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
    total_cents bigint NOT NULL CHECK (total_cents >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (customer_id, request_key)
);
CREATE INDEX orders_customer_time_idx
    ON shop.orders (customer_id, created_at DESC, id DESC);

CREATE TABLE shop.order_items (
    order_id bigint NOT NULL REFERENCES shop.orders(id),
    product_id bigint NOT NULL REFERENCES shop.products(id),
    quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 1000),
    unit_price_cents bigint NOT NULL CHECK (unit_price_cents BETWEEN 1 AND 100000000),
    line_total_cents bigint GENERATED ALWAYS AS
        (quantity::bigint * unit_price_cents) STORED,
    PRIMARY KEY (order_id, product_id)
);
CREATE INDEX order_items_product_idx ON shop.order_items(product_id);

CREATE TABLE shop.payments (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES shop.orders(id),
    provider_ref text NOT NULL UNIQUE,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    status text NOT NULL CHECK (status IN ('succeeded', 'failed')),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON shop.payments(order_id);
CREATE UNIQUE INDEX payments_one_success_idx
    ON shop.payments(order_id) WHERE status = 'succeeded';

CREATE TABLE shop.stock_movements (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id bigint NOT NULL REFERENCES shop.products(id),
    order_id bigint REFERENCES shop.orders(id),
    delta integer NOT NULL CHECK (delta <> 0),
    reason text NOT NULL CHECK (reason IN ('opening', 'order', 'adjustment')),
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK ((reason = 'order') = (order_id IS NOT NULL)),
    UNIQUE (order_id, product_id)
);
CREATE INDEX stock_movements_product_idx ON shop.stock_movements(product_id);

CREATE TABLE shop.outbox (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES shop.orders(id),
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    delivered_at timestamptz,
    UNIQUE (order_id, event_type)
);
COMMIT;
