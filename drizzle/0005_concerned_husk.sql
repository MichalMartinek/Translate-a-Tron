ALTER TABLE "Token" ADD COLUMN "key" varchar(228) NOT NULL;--> statement-breakpoint
ALTER TABLE "Token" DROP COLUMN IF EXISTS "term";