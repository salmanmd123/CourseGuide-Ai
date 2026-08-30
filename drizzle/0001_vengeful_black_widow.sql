ALTER TABLE "progress" ADD COLUMN "watched_seconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "watch_percentage" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" DROP COLUMN "progress";