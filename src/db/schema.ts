
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  unique,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

/* =========================
   USERS
========================= */

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),

  role: varchar("role", {
    length: 20,
  })
    .default("USER")
    .notNull(),

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
     ENGLISH / HINDI
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
  }).unique(),

  youtubePlaylistId: varchar("youtube_playlist_id", {
    length: 100,
  }).unique(),

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

  duration: varchar("duration", {
    length: 50,
  }),

  order: integer("order").notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});

/* =========================
   USER PROGRESS

   watchedSeconds:
   Total unique content watched.

   positionSeconds:
   Last playback position for resuming.

   watchedIntervals:
   Previously watched video sections,
   stored as [startSeconds, endSeconds].
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

    // Total unique content watched, in seconds.
    watchedSeconds: integer("watched_seconds")
      .default(0)
      .notNull(),

    // Percentage based on unique watched content: 0–100.
    watchPercentage: integer("watch_percentage")
      .default(0)
      .notNull(),

    // Previously watched intervals: [[start, end], ...].
    watchedIntervals: jsonb("watched_intervals")
      .$type<[number, number][]>()
      .notNull()
      .default([]),

    // Last playback position, in seconds.
    positionSeconds: integer("position_seconds")
      .default(0)
      .notNull(),

    // Automatically becomes true at 90% unique watched content.
    completed: boolean("completed")
      .default(false)
      .notNull(),

    completedAt: timestamp("completed_at"),
  },

  (table) => ({
    userLessonUnique: unique().on(
      table.userId,
      table.lessonId
    ),
  })
);


/* =========================
   QUIZ SUBJECTS
========================= */

export const quizSubjects = pgTable(
  "quiz_subjects",
  {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 100 })
      .notNull(),

    slug: varchar("slug", { length: 120 })
      .notNull()
      .unique(),

    description: text("description"),

    category: varchar("category", { length: 50 })
      .default("PROGRAMMING")
      .notNull(),

    icon: varchar("icon", { length: 50 })
      .default("book-open")
      .notNull(),

    sortOrder: integer("sort_order")
      .default(0)
      .notNull(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("quiz_subjects_active_idx").on(table.isActive),
  ]
);

/* =========================
   QUIZ TOPICS
========================= */

export const quizTopics = pgTable(
  "quiz_topics",
  {
    id: serial("id").primaryKey(),

    subjectId: integer("subject_id")
      .notNull()
      .references(() => quizSubjects.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", { length: 120 })
      .notNull(),

    slug: varchar("slug", { length: 140 })
      .notNull(),

    description: text("description"),

    sortOrder: integer("sort_order")
      .default(0)
      .notNull(),

    isActive: boolean("is_active")
      .default(true)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("quiz_topics_subject_slug_unique").on(
      table.subjectId,
      table.slug
    ),
    index("quiz_topics_subject_idx").on(table.subjectId),
  ]
);

/* =========================
   QUIZZES
========================= */

export const quizzes = pgTable(
  "quizzes",
  {
    id: serial("id").primaryKey(),

    subjectId: integer("subject_id")
      .notNull()
      .references(() => quizSubjects.id, {
        onDelete: "restrict",
      }),

    topicId: integer("topic_id")
      .references(() => quizTopics.id, {
        onDelete: "set null",
      }),

    title: varchar("title", { length: 200 })
      .notNull(),

    description: text("description"),

    difficulty: varchar("difficulty", { length: 20 })
      .default("MEDIUM")
      .notNull(),

    // CURATED = reusable prepared quiz
    // AI = AI-generated quiz
    quizType: varchar("quiz_type", { length: 20 })
      .default("CURATED")
      .notNull(),

    questionCount: integer("question_count")
      .default(0)
      .notNull(),

    isPublished: boolean("is_published")
      .default(false)
      .notNull(),

    // User who created an AI quiz, if applicable.
    // Null means the quiz is shared independently
    // of a particular creator.
    createdBy: integer("created_by")
      .references(() => users.id, {
        onDelete: "set null",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("quizzes_subject_idx").on(table.subjectId),
    index("quizzes_topic_idx").on(table.topicId),
    index("quizzes_published_idx").on(table.isPublished),
    index("quizzes_type_difficulty_idx").on(
      table.quizType,
      table.difficulty
    ),
  ]
);

/* =========================
   QUIZ QUESTIONS
========================= */

export const quizQuestions = pgTable(
  "quiz_questions",
  {
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

    // A, B, C, or D
    correctAnswer: varchar("correct_answer", {
      length: 1,
    }).notNull(),

    explanation: text("explanation")
      .default("")
      .notNull(),

    sortOrder: integer("sort_order")
      .default(0)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("quiz_questions_quiz_idx").on(table.quizId),
  ]
);

/* =========================
   QUIZ ATTEMPTS
========================= */

export const quizAttempts = pgTable(
  "quiz_attempts",
  {
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

    // Number of correct answers, calculated server-side.
    score: integer("score").notNull(),

    totalQuestions: integer("total_questions")
      .notNull(),

    // Example: { "12": "A", "13": "C" }
    // Keys are question IDs and values are selected options.
    answers: jsonb("answers")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),

    completedAt: timestamp("completed_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("quiz_attempts_user_idx").on(table.userId),
    index("quiz_attempts_quiz_idx").on(table.quizId),
    index("quiz_attempts_completed_idx").on(
      table.userId,
      table.completedAt
    ),
  ]
);


/* =========================
   AI NOTES

   ONE NOTE PER LESSON

   The generated notes are shared
   by all learners.
========================= */

export const aiNotes = pgTable(
  "ai_notes",
  {
    id: serial("id").primaryKey(),

    /*
     * User who originally generated
     * the shared note.
     */
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    /*
     * One AI note belongs to one lesson.
     */
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, {
        onDelete: "cascade",
      }),

    content: text("content").notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },

  (table) => ({
    lessonUnique: unique().on(
      table.lessonId
    ),
  })
);

/* =========================
   AI TUTOR CONVERSATIONS
========================= */

export const aiTutorMessages = pgTable(
  "ai_tutor_messages",
  {
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

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  }
);


