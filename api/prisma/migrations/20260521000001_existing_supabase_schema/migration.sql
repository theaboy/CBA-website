CREATE TYPE "license_type" AS ENUM ('basic', 'premium', 'exclusive');
CREATE TYPE "booking_type" AS ENUM ('studio', 'dj');
CREATE TYPE "booking_status" AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE "beats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text UNIQUE NOT NULL,
  "title" text NOT NULL,
  "tagline" text NOT NULL,
  "description" text NOT NULL,
  "bpm" int NOT NULL,
  "musical_key" text NOT NULL,
  "genre" text NOT NULL,
  "mood" text NOT NULL,
  "price_basic" numeric(10,2) NOT NULL,
  "price_premium" numeric(10,2) NOT NULL,
  "price_exclusive" numeric(10,2) NOT NULL,
  "preview_key" text NOT NULL,
  "full_key" text NOT NULL,
  "artwork_key" text NOT NULL,
  "tags" text[] NOT NULL DEFAULT '{}',
  "best_for" text[] NOT NULL DEFAULT '{}',
  "mix_palette" text[] NOT NULL DEFAULT '{}',
  "featured" boolean NOT NULL DEFAULT false,
  "is_exclusive_sold" boolean NOT NULL DEFAULT false,
  "play_count" int NOT NULL DEFAULT 0,
  "published" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "slug" text UNIQUE NOT NULL,
  "description" text,
  "date" timestamptz NOT NULL,
  "venue" text,
  "location" text NOT NULL,
  "poster_key" text,
  "ticket_price" numeric(10,2) NOT NULL,
  "ticket_capacity" int NOT NULL,
  "tickets_sold" int NOT NULL DEFAULT 0,
  "published" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "orders_beat" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "beat_id" uuid NOT NULL REFERENCES "beats"("id"),
  "license_type" license_type NOT NULL,
  "stripe_payment_intent_id" text,
  "buyer_email" text NOT NULL,
  "buyer_name" text NOT NULL,
  "amount_paid" numeric(10,2) NOT NULL,
  "full_download_token" uuid NOT NULL DEFAULT gen_random_uuid(),
  "download_count" int NOT NULL DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "orders_ticket" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" uuid NOT NULL REFERENCES "events"("id"),
  "stripe_payment_intent_id" text,
  "buyer_email" text NOT NULL,
  "buyer_name" text NOT NULL,
  "amount_paid" numeric(10,2) NOT NULL,
  "quantity" int NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_ticket_id" uuid NOT NULL REFERENCES "orders_ticket"("id"),
  "qr_token" uuid NOT NULL DEFAULT gen_random_uuid(),
  "checked_in" boolean NOT NULL DEFAULT false,
  "checked_in_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "tickets_qr_token_unique" UNIQUE ("qr_token")
);

CREATE TABLE "bookings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" booking_type NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "message" text,
  "event_date" timestamptz,
  "duration_hours" int,
  "notes" text,
  "status" booking_status NOT NULL DEFAULT 'pending',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "beats_genre_idx" ON "beats"("genre");
CREATE INDEX "beats_mood_idx" ON "beats"("mood");
CREATE INDEX "beats_published_idx" ON "beats"("published");
CREATE INDEX "beats_featured_idx" ON "beats"("featured");
CREATE INDEX "events_published_idx" ON "events"("published");
CREATE INDEX "events_date_idx" ON "events"("date");
