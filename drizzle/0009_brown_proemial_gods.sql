ALTER TABLE "Translation" ADD COLUMN "generated_by_ai" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "Translation" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "Translation" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "Translation" ADD COLUMN "updated_by_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Translation" ADD CONSTRAINT "Translation_updated_by_id_User_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
