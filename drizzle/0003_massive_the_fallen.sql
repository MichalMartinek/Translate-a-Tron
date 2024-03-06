ALTER TABLE "Project" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Term" ALTER COLUMN "term" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Term" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Translation" ALTER COLUMN "term_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Translation" ALTER COLUMN "translation" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Translation" ALTER COLUMN "lang" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Project" ADD COLUMN "lang" varchar(8) NOT NULL;