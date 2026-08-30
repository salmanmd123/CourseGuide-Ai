ALTER TABLE "courses" ALTER COLUMN "lessons_count" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "courses" ALTER COLUMN "featured" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "course_type" varchar(20) DEFAULT 'VIDEO' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "language" varchar(20) DEFAULT 'English' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "youtube_url" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "youtube_id" varchar(100);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "channel_name" varchar(200);--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "likes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "recommendation_score" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "admin_recommended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;