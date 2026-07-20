CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

CREATE TABLE "attendees" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "document" TEXT,
    "document_type" TEXT,
    "company" TEXT,
    "position" TEXT,
    "category" TEXT NOT NULL DEFAULT 'visitor',
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "attendees" ADD CONSTRAINT "attendees_event_id_email_key" UNIQUE ("event_id", "email");
CREATE INDEX "attendees_event_id_idx" ON "attendees"("event_id");
CREATE INDEX "attendees_organization_id_idx" ON "attendees"("organization_id");
CREATE INDEX "attendees_company_idx" ON "attendees"("company");

CREATE TABLE "credentials" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "attendee_id" UUID NOT NULL UNIQUE REFERENCES "attendees"("id"),
    "event_id" UUID NOT NULL,
    "qr_code" TEXT NOT NULL,
    "qr_data" TEXT,
    "nfc_tag" TEXT,
    "rfid_tag" TEXT,
    "printed_at" TIMESTAMPTZ,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "credentials" ADD CONSTRAINT "credentials_qr_code_key" UNIQUE ("qr_code");
CREATE INDEX "credentials_event_id_idx" ON "credentials"("event_id");

CREATE TABLE "check_ins" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "attendee_id" UUID NOT NULL REFERENCES "attendees"("id"),
    "event_id" UUID NOT NULL,
    "method" TEXT NOT NULL,
    "checked_in_by" UUID,
    "device_id" TEXT,
    "ip_address" TEXT,
    "location" JSONB,
    "photo_url" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "is_synced" BOOLEAN NOT NULL DEFAULT true,
    "synced_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_attendee_id_event_id_key" UNIQUE ("attendee_id", "event_id");
CREATE INDEX "check_ins_attendee_id_idx" ON "check_ins"("attendee_id");
CREATE INDEX "check_ins_event_id_idx" ON "check_ins"("event_id");
CREATE INDEX "check_ins_event_id_method_idx" ON "check_ins"("event_id", "method");
