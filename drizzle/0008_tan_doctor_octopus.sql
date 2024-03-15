ALTER TABLE "Token" DROP CONSTRAINT "Token_user_id_User_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Token" ADD CONSTRAINT "Token_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
