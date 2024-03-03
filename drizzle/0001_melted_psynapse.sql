CREATE TABLE IF NOT EXISTS "Term" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" varchar(128)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Translation" (
	"id" serial PRIMARY KEY NOT NULL,
	"term_id" integer,
	"translation" text,
	"lang" varchar(8)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Translation" ADD CONSTRAINT "Translation_term_id_Term_id_fk" FOREIGN KEY ("term_id") REFERENCES "Term"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
