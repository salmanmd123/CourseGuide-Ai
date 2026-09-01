import { pgTable, unique, serial, varchar, text, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const courses = pgTable("courses", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	level: varchar({ length: 50 }).notNull(),
	duration: varchar({ length: 50 }).notNull(),
	lessonsCount: integer("lessons_count").default(0).notNull(),
	rating: varchar({ length: 10 }).default('0'),
	students: varchar({ length: 50 }).default('0'),
	source: varchar({ length: 100 }).default('YouTube'),
	featured: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	courseType: varchar("course_type", { length: 20 }).default('VIDEO').notNull(),
	language: varchar({ length: 20 }).default('English').notNull(),
	youtubeUrl: text("youtube_url"),
	youtubeId: varchar("youtube_id", { length: 100 }),
	channelName: varchar("channel_name", { length: 200 }),
	thumbnailUrl: text("thumbnail_url"),
	views: integer().default(0).notNull(),
	likes: integer().default(0).notNull(),
	recommendationScore: integer("recommendation_score").default(0).notNull(),
	adminRecommended: boolean("admin_recommended").default(false).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("courses_slug_unique").on(table.slug),
	unique("courses_youtube_id_unique").on(table.youtubeId),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const aiTutorMessages = pgTable("ai_tutor_messages", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	lessonId: integer("lesson_id"),
	role: varchar({ length: 20 }).notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ai_tutor_messages_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "ai_tutor_messages_lesson_id_lessons_id_fk"
		}).onDelete("cascade"),
]);

export const progress = pgTable("progress", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	lessonId: integer("lesson_id").notNull(),
	completed: boolean().default(false).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	watchedSeconds: integer("watched_seconds").default(0).notNull(),
	watchPercentage: integer("watch_percentage").default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "progress_lesson_id_lessons_id_fk"
		}).onDelete("cascade"),
	unique("progress_user_id_lesson_id_unique").on(table.lessonId, table.userId),
]);

export const quizzes = pgTable("quizzes", {
	id: serial().primaryKey().notNull(),
	lessonId: integer("lesson_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "quizzes_lesson_id_lessons_id_fk"
		}).onDelete("cascade"),
]);

export const lessons = pgTable("lessons", {
	id: serial().primaryKey().notNull(),
	courseId: integer("course_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	videoUrl: text("video_url"),
	duration: varchar({ length: 50 }),
	order: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "lessons_course_id_courses_id_fk"
		}).onDelete("cascade"),
]);

export const aiNotes = pgTable("ai_notes", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	lessonId: integer("lesson_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ai_notes_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "ai_notes_lesson_id_lessons_id_fk"
		}).onDelete("cascade"),
]);

export const quizAttempts = pgTable("quiz_attempts", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	quizId: integer("quiz_id").notNull(),
	score: integer().notNull(),
	totalQuestions: integer("total_questions").notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "quiz_attempts_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.quizId],
			foreignColumns: [quizzes.id],
			name: "quiz_attempts_quiz_id_quizzes_id_fk"
		}).onDelete("cascade"),
]);

export const quizQuestions = pgTable("quiz_questions", {
	id: serial().primaryKey().notNull(),
	quizId: integer("quiz_id").notNull(),
	question: text().notNull(),
	optionA: text("option_a").notNull(),
	optionB: text("option_b").notNull(),
	optionC: text("option_c").notNull(),
	optionD: text("option_d").notNull(),
	correctAnswer: varchar("correct_answer", { length: 1 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.quizId],
			foreignColumns: [quizzes.id],
			name: "quiz_questions_quiz_id_quizzes_id_fk"
		}).onDelete("cascade"),
]);
