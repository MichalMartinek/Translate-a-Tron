CREATE TABLE IF NOT EXISTS "Project" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128)
);
--> statement-breakpoint
ALTER TABLE "Term" ADD COLUMN "project_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Term" ADD CONSTRAINT "Term_project_id_Project_id_fk" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
