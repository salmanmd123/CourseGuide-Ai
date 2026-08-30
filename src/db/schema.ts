import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  unique,
} from "drizzle-orm/pg-core";

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});


/* =========================
   COURSES
========================= */

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 200 }).notNull(),

  slug: varchar("slug", { length: 200 }).notNull().unique(),

  description: text("description").notNull(),

  category: varchar("category", { length: 100 }).notNull(),

  level: varchar("level", { length: 50 }).notNull(),

  /* =========================
     COURSE TYPE
     VIDEO = one complete video
     PLAYLIST = YouTube playlist
  ========================= */

  courseType: varchar("course_type", {
    length: 20,
  })
    .default("VIDEO")
    .notNull(),

  /* =========================
     LANGUAGE
     ENGLISH / HINDI / HINGLISH
  ========================= */

  language: varchar("language", {
    length: 20,
  })
    .default("English")
    .notNull(),

  /* =========================
     YOUTUBE INFORMATION
  ========================= */

  youtubeUrl: text("youtube_url"),

  youtubeId: varchar("youtube_id", {
    length: 100,
  }),

  channelName: varchar("channel_name", {
    length: 200,
  }),

  thumbnailUrl: text("thumbnail_url"),

  /* =========================
     YOUTUBE METADATA
  ========================= */

  views: integer("views").default(0).notNull(),

  likes: integer("likes").default(0).notNull(),

  /* =========================
     COURSE INFORMATION
  ========================= */

  duration: varchar("duration", {
    length: 50,
  }).notNull(),

  lessonsCount: integer("lessons_count")
    .default(0)
    .notNull(),

  rating: varchar("rating", {
    length: 10,
  }).default("0"),

  students: varchar("students", {
    length: 50,
  }).default("0"),

  source: varchar("source", {
    length: 100,
  }).default("YouTube"),

  /* =========================
     RECOMMENDATION
  ========================= */

  recommendationScore: integer("recommendation_score")
    .default(0)
    .notNull(),

  adminRecommended: boolean("admin_recommended")
    .default(false)
    .notNull(),

  featured: boolean("featured")
    .default(false)
    .notNull(),

  /* =========================
     TIMESTAMPS
  ========================= */

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});


/* =========================
   LESSONS
========================= */

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),

  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, {
      onDelete: "cascade",
    }),

  title: varchar("title", { length: 200 }).notNull(),

  description: text("description"),

  videoUrl: text("video_url"),

  duration: varchar("duration", { length: 50 }),

  order: integer("order").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});


/* =========================
   USER PROGRESS
========================= */

export const progress = pgTable(
  "progress",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, {
        onDelete: "cascade",
      }),

    // Last watched position in seconds
    watchedSeconds: integer("watched_seconds")
      .default(0)
      .notNull(),

    // Video watch percentage: 0–100
    watchPercentage: integer("watch_percentage")
      .default(0)
      .notNull(),

    // Automatically becomes true at 90%
    completed: boolean("completed")
      .default(false)
      .notNull(),

    completedAt: timestamp("completed_at"),
  },

  (table) => ({
    userLessonUnique: unique().on(
      table.userId,
      table.lessonId,
    ),
  }),
);


/* =========================
   QUIZZES
========================= */

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),

  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, {
      onDelete: "cascade",
    }),

  title: varchar("title", { length: 200 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});


/* =========================
   QUIZ QUESTIONS
========================= */

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),

  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, {
      onDelete: "cascade",
    }),

  question: text("question").notNull(),

  optionA: text("option_a").notNull(),

  optionB: text("option_b").notNull(),

  optionC: text("option_c").notNull(),

  optionD: text("option_d").notNull(),

  correctAnswer: varchar("correct_answer", {
    length: 1,
  }).notNull(),
});


/* =========================
   QUIZ ATTEMPTS
========================= */

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, {
      onDelete: "cascade",
    }),

  score: integer("score").notNull(),

  totalQuestions: integer("total_questions").notNull(),

  completedAt: timestamp("completed_at").defaultNow().notNull(),
});


/* =========================
   AI NOTES
========================= */

export const aiNotes = pgTable("ai_notes", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, {
      onDelete: "cascade",
    }),

  content: text("content").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


/* =========================
   AI TUTOR CONVERSATIONS
========================= */

export const aiTutorMessages = pgTable("ai_tutor_messages", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  lessonId: integer("lesson_id")
    .references(() => lessons.id, {
      onDelete: "cascade",
    }),

  role: varchar("role", {
    length: 20,
  }).notNull(),

  message: text("message").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});