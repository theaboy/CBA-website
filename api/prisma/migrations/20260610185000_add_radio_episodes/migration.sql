CREATE TABLE "radio_episodes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "source" text NOT NULL,
  "date_label" text NOT NULL,
  "duration" text NOT NULL,
  "type" text NOT NULL,
  "freq" text NOT NULL,
  "variant" text NOT NULL DEFAULT 'portable',
  "moods" text[] NOT NULL DEFAULT ARRAY[]::text[],
  "plays" int NOT NULL DEFAULT 0,
  "audio_src" text,
  "featured" boolean NOT NULL DEFAULT false,
  "published" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "radio_episodes_featured_idx" ON "radio_episodes" ("featured");
CREATE INDEX "radio_episodes_published_idx" ON "radio_episodes" ("published");
CREATE INDEX "radio_episodes_created_at_idx" ON "radio_episodes" ("created_at");
