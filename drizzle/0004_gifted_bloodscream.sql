ALTER TABLE "courses" ADD COLUMN "youtube_playlist_id" varchar(100);--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_youtube_playlist_id_unique" UNIQUE("youtube_playlist_id");