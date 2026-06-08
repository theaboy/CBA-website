CREATE TABLE "admin_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text UNIQUE NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "orders_beat"
  ADD COLUMN "download_expiry" timestamptz;

CREATE UNIQUE INDEX "orders_beat_full_download_token_key"
  ON "orders_beat"("full_download_token");
