ALTER TABLE "progress" ADD COLUMN "watched_intervals" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "position_seconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" varchar(20) DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_notes" ADD CONSTRAINT "ai_notes_lesson_id_unique" UNIQUE("lesson_id");