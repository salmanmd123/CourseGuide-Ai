import { relations } from "drizzle-orm/relations";
import { users, aiTutorMessages, lessons, progress, quizzes, courses, aiNotes, quizAttempts, quizQuestions } from "./schema";

export const aiTutorMessagesRelations = relations(aiTutorMessages, ({one}) => ({
	user: one(users, {
		fields: [aiTutorMessages.userId],
		references: [users.id]
	}),
	lesson: one(lessons, {
		fields: [aiTutorMessages.lessonId],
		references: [lessons.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	aiTutorMessages: many(aiTutorMessages),
	progresses: many(progress),
	aiNotes: many(aiNotes),
	quizAttempts: many(quizAttempts),
}));

export const lessonsRelations = relations(lessons, ({one, many}) => ({
	aiTutorMessages: many(aiTutorMessages),
	progresses: many(progress),
	quizzes: many(quizzes),
	course: one(courses, {
		fields: [lessons.courseId],
		references: [courses.id]
	}),
	aiNotes: many(aiNotes),
}));

export const progressRelations = relations(progress, ({one}) => ({
	user: one(users, {
		fields: [progress.userId],
		references: [users.id]
	}),
	lesson: one(lessons, {
		fields: [progress.lessonId],
		references: [lessons.id]
	}),
}));

export const quizzesRelations = relations(quizzes, ({one, many}) => ({
	lesson: one(lessons, {
		fields: [quizzes.lessonId],
		references: [lessons.id]
	}),
	quizAttempts: many(quizAttempts),
	quizQuestions: many(quizQuestions),
}));

export const coursesRelations = relations(courses, ({many}) => ({
	lessons: many(lessons),
}));

export const aiNotesRelations = relations(aiNotes, ({one}) => ({
	user: one(users, {
		fields: [aiNotes.userId],
		references: [users.id]
	}),
	lesson: one(lessons, {
		fields: [aiNotes.lessonId],
		references: [lessons.id]
	}),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({one}) => ({
	user: one(users, {
		fields: [quizAttempts.userId],
		references: [users.id]
	}),
	quiz: one(quizzes, {
		fields: [quizAttempts.quizId],
		references: [quizzes.id]
	}),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({one}) => ({
	quiz: one(quizzes, {
		fields: [quizQuestions.quizId],
		references: [quizzes.id]
	}),
}));