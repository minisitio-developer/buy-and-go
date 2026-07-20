CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

CREATE TABLE "ticket_types" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "original_price" DECIMAL(10, 2),
    "quantity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "min_per_order" INTEGER NOT NULL DEFAULT 1,
    "max_per_order" INTEGER NOT NULL DEFAULT 10,
    "sale_start" TIMESTAMPTZ,
    "sale_end" TIMESTAMPTZ,
    "status" TEXT NOT NULL DEFAULT 'active',
    "requires_document" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "has_seat_number" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ticket_types_event_id_idx" ON "ticket_types"("event_id");

CREATE TABLE "ticket_lots" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ticket_type_id" UUID NOT NULL REFERENCES "ticket_types"("id"),
    "name" TEXT NOT NULL,
    "price" DECIMAL(10, 2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ticket_lots_ticket_type_id_idx" ON "ticket_lots"("ticket_type_id");

CREATE TABLE "coupons" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "event_id" UUID,
    "code" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(10, 2) NOT NULL,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "min_tickets" INTEGER NOT NULL DEFAULT 1,
    "max_tickets" INTEGER,
    "valid_from" TIMESTAMPTZ,
    "valid_until" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "coupons" ADD CONSTRAINT "coupons_event_id_code_key" UNIQUE ("event_id", "code");

CREATE TABLE "orders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "total" DECIMAL(10, 2) NOT NULL,
    "discount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "fee" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "net_total" DECIMAL(10, 2) NOT NULL,
    "payment_method" TEXT,
    "payment_id" TEXT,
    "coupon_id" UUID,
    "paid_at" TIMESTAMPTZ,
    "refunded_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "orders_event_id_idx" ON "orders"("event_id");
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");

CREATE TABLE "order_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL REFERENCES "orders"("id"),
    "ticket_type_id" UUID NOT NULL REFERENCES "ticket_types"("id"),
    "lot_id" UUID,
    "unit_price" DECIMAL(10, 2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total" DECIMAL(10, 2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
