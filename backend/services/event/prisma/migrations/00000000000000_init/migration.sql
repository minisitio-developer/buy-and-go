CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public";

CREATE TABLE "events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "timezone" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "language" TEXT NOT NULL DEFAULT 'pt-BR',
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "capacity" INTEGER,
    "expected_public" INTEGER,
    "location_name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Brasil',
    "latitude" DECIMAL(10, 7),
    "longitude" DECIMAL(10, 7),
    "banner_url" TEXT,
    "logo_url" TEXT,
    "website_url" TEXT,
    "hashtag" TEXT,
    "cover_image" TEXT,
    "video_url" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ
);

ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_slug_key" UNIQUE ("organization_id", "slug");
CREATE INDEX "events_organization_id_idx" ON "events"("organization_id");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE INDEX "events_city_idx" ON "events"("city");

CREATE TABLE "event_rooms" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "capacity" INTEGER,
    "floor" TEXT,
    "location" TEXT,
    "type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "event_rooms_event_id_idx" ON "event_rooms"("event_id");

CREATE TABLE "event_schedules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "speaker" TEXT,
    "speaker_bio" TEXT,
    "speaker_photo" TEXT,
    "room" TEXT,
    "stage" TEXT,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "type" TEXT,
    "capacity" INTEGER,
    "has_certificate" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "event_schedules_event_id_idx" ON "event_schedules"("event_id");
CREATE INDEX "event_schedules_event_id_start_time_idx" ON "event_schedules"("event_id", "start_time");
