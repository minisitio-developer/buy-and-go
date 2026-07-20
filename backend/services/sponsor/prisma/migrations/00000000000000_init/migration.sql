CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

CREATE TYPE "SponsorTier" AS ENUM ('diamond', 'gold', 'silver', 'bronze');
CREATE TYPE "SponsorStatus" AS ENUM ('active', 'inactive', 'pending', 'cancelled');
CREATE TYPE "SponsorBoothStatus" AS ENUM ('active', 'reserved', 'maintenance', 'inactive');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

CREATE TABLE "sponsors" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "tier" "SponsorTier" NOT NULL DEFAULT 'silver',
    "status" "SponsorStatus" NOT NULL DEFAULT 'active',
    "contract_url" TEXT,
    "value" DECIMAL(12, 2),
    "signed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "sponsors_event_id_idx" ON "sponsors"("event_id");
CREATE INDEX "sponsors_organization_id_idx" ON "sponsors"("organization_id");
CREATE INDEX "sponsors_tier_idx" ON "sponsors"("tier");

CREATE TABLE "sponsor_booths" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sponsor_id" UUID NOT NULL REFERENCES "sponsors"("id"),
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "size" TEXT,
    "status" "SponsorBoothStatus" NOT NULL DEFAULT 'active',
    "checkins" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "sponsor_booths_sponsor_id_idx" ON "sponsor_booths"("sponsor_id");
CREATE INDEX "sponsor_booths_event_id_idx" ON "sponsor_booths"("event_id");

CREATE TABLE "sponsor_metrics" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sponsor_id" UUID NOT NULL REFERENCES "sponsors"("id"),
    "event_id" UUID NOT NULL,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "avg_stay_time" DOUBLE PRECISION,
    "revisit_rate" DOUBLE PRECISION,
    "peak_hour" INTEGER,
    "profile" JSONB NOT NULL DEFAULT '{}',
    "recorded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "sponsor_metrics_sponsor_id_idx" ON "sponsor_metrics"("sponsor_id");
CREATE INDEX "sponsor_metrics_event_id_idx" ON "sponsor_metrics"("event_id");
CREATE INDEX "sponsor_metrics_recorded_at_idx" ON "sponsor_metrics"("recorded_at");

CREATE TABLE "sponsor_payments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sponsor_id" UUID NOT NULL REFERENCES "sponsors"("id"),
    "installment" INTEGER NOT NULL DEFAULT 1,
    "value" DECIMAL(12, 2) NOT NULL,
    "due_date" TIMESTAMPTZ NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "sponsor_payments_sponsor_id_idx" ON "sponsor_payments"("sponsor_id");
CREATE INDEX "sponsor_payments_status_idx" ON "sponsor_payments"("status");
