ALTER TABLE "Term" DROP CONSTRAINT "Term_project_id_Project_id_fk";
--> statement-breakpoint
ALTER TABLE "Translation" DROP CONSTRAINT "Translation_term_id_Term_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Term" ADD CONSTRAINT "Term_project_id_Project_id_fk" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Translation" ADD CONSTRAINT "Translation_term_id_Term_id_fk" FOREIGN KEY ("term_id") REFERENCES "Term"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
