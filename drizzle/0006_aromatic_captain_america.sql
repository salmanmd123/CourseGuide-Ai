
DROP TABLE IF EXISTS "quiz_attempts" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "quiz_questions" CASCADE;
--> statement-breakpoint
DROP TABLE IF EXISTS "quizzes" CASCADE;
--> statement-breakpoint

CREATE TABLE "quiz_subjects" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "slug" varchar(120) NOT NULL,
    "description" text,
    "category" varchar(50) DEFAULT 'PROGRAMMING' NOT NULL,
    "icon" varchar(50) DEFAULT 'book-open' NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "quiz_subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint

CREATE TABLE "quiz_topics" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer NOT NULL,
    "name" varchar(120) NOT NULL,
    "slug" varchar(140) NOT NULL,
    "description" text,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "quiz_topics_subject_slug_unique"
        UNIQUE("subject_id", "slug")
);
--> statement-breakpoint

CREATE TABLE "quizzes" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer NOT NULL,
    "topic_id" integer,
    "title" varchar(255) NOT NULL,
    "description" text,
    "difficulty" varchar(20) DEFAULT 'MEDIUM' NOT NULL,
    "quiz_type" varchar(20) DEFAULT 'CURATED' NOT NULL,
    "question_count" integer DEFAULT 0 NOT NULL,
    "is_published" boolean DEFAULT false NOT NULL,
    "created_by" integer,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "quiz_questions" (
    "id" serial PRIMARY KEY NOT NULL,
    "quiz_id" integer NOT NULL,
    "question" text NOT NULL,
    "option_a" text NOT NULL,
    "option_b" text NOT NULL,
    "option_c" text NOT NULL,
    "option_d" text NOT NULL,
    "correct_answer" varchar(1) NOT NULL,
    "explanation" text DEFAULT '' NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "quiz_attempts" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "quiz_id" integer NOT NULL,
    "score" integer NOT NULL,
    "total_questions" integer NOT NULL,
    "answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "quiz_topics"
ADD CONSTRAINT "quiz_topics_subject_id_quiz_subjects_id_fk"
FOREIGN KEY ("subject_id")
REFERENCES "public"."quiz_subjects"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quizzes"
ADD CONSTRAINT "quizzes_subject_id_quiz_subjects_id_fk"
FOREIGN KEY ("subject_id")
REFERENCES "public"."quiz_subjects"("id")
ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quizzes"
ADD CONSTRAINT "quizzes_topic_id_quiz_topics_id_fk"
FOREIGN KEY ("topic_id")
REFERENCES "public"."quiz_topics"("id")
ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quizzes"
ADD CONSTRAINT "quizzes_created_by_users_id_fk"
FOREIGN KEY ("created_by")
REFERENCES "public"."users"("id")
ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_questions"
ADD CONSTRAINT "quiz_questions_quiz_id_quizzes_id_fk"
FOREIGN KEY ("quiz_id")
REFERENCES "public"."quizzes"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_attempts"
ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "quiz_attempts"
ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk"
FOREIGN KEY ("quiz_id")
REFERENCES "public"."quizzes"("id")
ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

CREATE INDEX "quiz_subjects_active_idx"
ON "quiz_subjects" USING btree ("is_active");
--> statement-breakpoint

CREATE INDEX "quiz_topics_subject_idx"
ON "quiz_topics" USING btree ("subject_id");
--> statement-breakpoint

CREATE INDEX "quizzes_subject_idx"
ON "quizzes" USING btree ("subject_id");
--> statement-breakpoint

CREATE INDEX "quizzes_topic_idx"
ON "quizzes" USING btree ("topic_id");
--> statement-breakpoint

CREATE INDEX "quizzes_published_idx"
ON "quizzes" USING btree ("is_published");
--> statement-breakpoint

CREATE INDEX "quizzes_type_difficulty_idx"
ON "quizzes" USING btree ("quiz_type", "difficulty");
--> statement-breakpoint

CREATE INDEX "quiz_questions_quiz_idx"
ON "quiz_questions" USING btree ("quiz_id");
--> statement-breakpoint

CREATE INDEX "quiz_attempts_user_idx"
ON "quiz_attempts" USING btree ("user_id");
--> statement-breakpoint

CREATE INDEX "quiz_attempts_quiz_idx"
ON "quiz_attempts" USING btree ("quiz_id");
--> statement-breakpoint

CREATE INDEX "quiz_attempts_completed_idx"
ON "quiz_attempts" USING btree ("user_id", "completed_at");
