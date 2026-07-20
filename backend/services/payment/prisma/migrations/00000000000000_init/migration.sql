CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

CREATE TABLE "payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "order_id" UUID,
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "fee" DECIMAL(12, 2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12, 2) NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'credit_card',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "gateway" TEXT,
    "gateway_id" TEXT,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "paid_at" TIMESTAMPTZ,
    "refunded_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "payments_event_id_idx" ON "payments"("event_id");
CREATE INDEX "payments_organization_id_idx" ON "payments"("organization_id");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_method_idx" ON "payments"("method");

CREATE TABLE "transactions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL REFERENCES "payments"("id"),
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "status" TEXT NOT NULL,
    "gateway_response" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "transactions_payment_id_idx" ON "transactions"("payment_id");

CREATE TABLE "refunds" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL REFERENCES "payments"("id"),
    "amount" DECIMAL(12, 2) NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "initiated_by" TEXT NOT NULL,
    "approved_by" UUID,
    "processed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

CREATE TABLE "gateway_configs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "gateway" TEXT NOT NULL,
    "credentials" JSONB NOT NULL,
    "webhook_secret" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "gateway_configs" ADD CONSTRAINT "gateway_configs_organization_id_gateway_key" UNIQUE ("organization_id", "gateway");
CREATE INDEX "gateway_configs_organization_id_idx" ON "gateway_configs"("organization_id");

CREATE TABLE "pix_payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL UNIQUE REFERENCES "payments"("id"),
    "txid" TEXT NOT NULL,
    "qr_code" TEXT,
    "qr_code_text" TEXT,
    "expiration" TIMESTAMPTZ NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "pix_payments" ADD CONSTRAINT "pix_payments_txid_key" UNIQUE ("txid");
CREATE INDEX "pix_payments_txid_idx" ON "pix_payments"("txid");

CREATE TABLE "boleto_payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL UNIQUE REFERENCES "payments"("id"),
    "barcode" TEXT,
    "line" TEXT,
    "url" TEXT,
    "due_date" TIMESTAMPTZ NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "boleto_payments" ADD CONSTRAINT "boleto_payments_barcode_key" UNIQUE ("barcode");
CREATE INDEX "boleto_payments_barcode_idx" ON "boleto_payments"("barcode");
