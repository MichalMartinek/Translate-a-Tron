CREATE TABLE IF NOT EXISTS "Token" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" varchar(228) NOT NULL,
	"expired" boolean NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Token" ADD CONSTRAINT "Token_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
