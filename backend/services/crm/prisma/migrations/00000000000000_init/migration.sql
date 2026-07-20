CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

CREATE TABLE "crm_pipelines" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "crm_stages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "pipeline_id" UUID NOT NULL REFERENCES "crm_pipelines"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "color" TEXT,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "crm_contacts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "document" TEXT,
    "company" TEXT,
    "position" TEXT,
    "source" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "crm_contacts_organization_id_idx" ON "crm_contacts"("organization_id");

CREATE TABLE "crm_deals" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL REFERENCES "crm_pipelines"("id"),
    "stage_id" UUID NOT NULL REFERENCES "crm_stages"("id"),
    "title" TEXT NOT NULL,
    "value" DECIMAL(12, 2) NOT NULL DEFAULT 0,
    "contact_id" UUID REFERENCES "crm_contacts"("id"),
    "owner_id" UUID,
    "source" TEXT,
    "expected_close" TIMESTAMPTZ,
    "closed_at" TIMESTAMPTZ,
    "lost_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "crm_deals_organization_id_idx" ON "crm_deals"("organization_id");
CREATE INDEX "crm_deals_pipeline_id_idx" ON "crm_deals"("pipeline_id");
CREATE INDEX "crm_deals_stage_id_idx" ON "crm_deals"("stage_id");
CREATE INDEX "crm_deals_owner_id_idx" ON "crm_deals"("owner_id");
