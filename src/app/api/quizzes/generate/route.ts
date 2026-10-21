
import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import {
  quizSubjects,
  quizTopics,
  quizzes,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { encryptQuizPayload } from "@/lib/quiz-token";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const NVIDIA_API_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const DEFAULT_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";
const BATCH_SIZE = 5;
const MAX_BATCH_ATTEMPTS = 4;
const MAX_DUPLICATE_REGENERATIONS = 3;
const REQUEST_TIMEOUT_MS = 45000;

type GeneratedQuestion = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
};

function extractJson(content: string): unknown {
  const cleaned = content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:json)?/gi, "")
    .trim();

  const startArray = cleaned.indexOf("[");
  const startObject = cleaned.indexOf("{");

  let start = -1;

  if (
    startArray !== -1 &&
    (startObject === -1 || startArray < startObject)
  ) {
    start = startArray;
  } else if (startObject !== -1) {
    start = startObject;
  }

  if (start === -1) {
    throw new Error("The AI response did not contain JSON.");
  }

  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  let end = -1;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }

      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{" || char === "[") {
      stack.push(char);
    } else if (char === "}" || char === "]") {
      const expectedOpening = char === "}" ? "{" : "[";

      if (stack.pop() !== expectedOpening) {
        throw new Error(
          "The AI response contains mismatched JSON brackets."
        );
      }

      if (stack.length === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error("The AI response was incomplete.");
  }

  const candidate = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    const repaired = candidate.replace(/,\s*([}\]])/g, "$1");

    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error("The AI returned malformed JSON.");
    }
  }
}

/**
 * Normalizes question wording and code formatting for duplicate detection.
 * This is used only for question text, never for answer options.
 */
function normalizeQuestion(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```[\w-]*/g, "").replace(/```/g, "")
    )
    .replace(/`/g, "")
    .replace(/[\s\p{P}\p{S}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findDuplicateQuestion(
  questions: GeneratedQuestion[],
  previouslySeen: Set<string>
): string | null {
  const seenInBatch = new Set<string>();

  for (const question of questions) {
    const normalized = normalizeQuestion(question.question);

    if (
      previouslySeen.has(normalized) ||
      seenInBatch.has(normalized)
    ) {
      return question.question;
    }

    seenInBatch.add(normalized);
  }

  return null;
}

function validateQuestions(
  value: unknown,
  expectedCount: number
): GeneratedQuestion[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The AI response must be a JSON object.");
  }

  const rawQuestions = (
    value as { questions?: unknown }
  ).questions;

  if (!Array.isArray(rawQuestions)) {
    throw new Error(
      "The AI response does not contain a questions array."
    );
  }

  if (rawQuestions.length !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} questions but received ${rawQuestions.length}.`
    );
  }

  return rawQuestions.map((item, index) => {
    const questionNumber = index + 1;

    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      throw new Error(`Question ${questionNumber} is invalid.`);
    }

    const q = item as Record<string, unknown>;

    const fields = [
      "question",
      "optionA",
      "optionB",
      "optionC",
      "optionD",
      "correctAnswer",
      "explanation",
    ] as const;

    for (const field of fields) {
      if (
        typeof q[field] !== "string" ||
        !q[field].trim()
      ) {
        throw new Error(
          `Question ${questionNumber} is missing ${field}.`
        );
      }
    }

    const question = (q.question as string).trim();

    const options = [
      (q.optionA as string).trim(),
      (q.optionB as string).trim(),
      (q.optionC as string).trim(),
      (q.optionD as string).trim(),
    ];

    if (question.length < 5) {
      throw new Error(
        `Question ${questionNumber} is too short.`
      );
    }

    if (options.some((option) => option.length === 0)) {
      throw new Error(
        `Question ${questionNumber} has an empty option.`
      );
    }

    // Deliberately no duplicate-option validation.
    // Keep the AI's four options as returned.

    const correctAnswer = (
      q.correctAnswer as string
    ).trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(correctAnswer)) {
      throw new Error(
        `Question ${questionNumber} has an invalid correct answer.`
      );
    }

    return {
      question,
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctAnswer,
      explanation: (q.explanation as string).trim(),
    };
  });
}

function buildPrompt(
  count: number,
  subjectName: string,
  topicDescription: string,
  difficulty: string,
  previousError?: string,
  excludedQuestions: string[] = []
): string {
  const excludedSection = excludedQuestions.length
    ? `
QUESTIONS ALREADY USED — DO NOT REPEAT THESE:
${excludedQuestions
  .map((question, index) => `${index + 1}. ${question}`)
  .join("\n\n")}

Create different questions testing different examples, concepts, or scenarios.
Do not simply reword any question listed above.
`
    : "";

  const correction = previousError
    ? `
CORRECTION REQUIRED:
${previousError}

Fix this issue in your response.
`
    : "";

  return `
You are an expert technical educator creating a multiple-choice quiz.

SUBJECT: ${subjectName}
${topicDescription}
DIFFICULTY: ${difficulty}

Generate exactly ${count} questions.

REQUIREMENTS:
1. Every question must be clear, accurate, and relevant.
2. Each question must have four options: optionA, optionB, optionC, optionD.
3. Select one intended correct answer and three distractors.
4. correctAnswer must be exactly "A", "B", "C", or "D".
5. Include a concise explanation of the correct answer.
6. Match the requested difficulty.
7. All required fields must be non-empty strings.
8. Do not repeat questions within this batch.
9. Do not repeat questions listed in the excluded section.
10. Use different examples and concepts rather than changing only variable names or numbers in an existing question.
11. Do not omit correctAnswer.

OPTIONS:
- Return the four options exactly as you generate them.
- Do not omit or rename option fields.
- The application will not reject options because they are similar or repeated.

${excludedSection}
${correction}

Return only valid JSON using this structure:

{
  "questions": [
    {
      "question": "Question text",
      "optionA": "First option",
      "optionB": "Second option",
      "optionC": "Third option",
      "optionD": "Fourth option",
      "correctAnswer": "A",
      "explanation": "Explanation of the correct answer"
    }
  ]
}

The questions array must contain exactly ${count} objects.
Do not include Markdown, commentary, or additional properties.
`;
}

async function generateBatch(
  apiKey: string,
  count: number,
  subjectName: string,
  topicDescription: string,
  difficulty: string,
  excludedQuestions: string[] = []
): Promise<GeneratedQuestion[]> {
  let previousError: string | undefined;

  for (
    let attempt = 1;
    attempt <= MAX_BATCH_ATTEMPTS;
    attempt++
  ) {
    const prompt = buildPrompt(
      count,
      subjectName,
      topicDescription,
      difficulty,
      previousError,
      excludedQuestions
    );

    try {
      const response = await fetch(NVIDIA_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.NVIDIA_MODEL ?? DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are an expert technical educator. Generate accurate multiple-choice questions. Always include four option fields, a valid correctAnswer of A, B, C, or D, and an explanation. Never repeat questions provided in the excluded list. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: attempt === 1 ? 0.4 : 0.7,
          max_tokens: 4096,
          stream: false,
          chat_template_kwargs: {
            enable_thinking: false,
          },
          response_format: {
            type: "json_object",
          },
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "NVIDIA batch request failed:",
          response.status,
          errorText.slice(0, 1000)
        );

        throw new Error(
          `The AI provider returned HTTP ${response.status}.`
        );
      }

      const result = await response.json();
      const choice = result?.choices?.[0];
      const content = choice?.message?.content;

      if (choice?.finish_reason === "length") {
        throw new Error("The AI response was truncated.");
      }

      if (
        typeof content !== "string" ||
        !content.trim()
      ) {
        throw new Error("The AI returned an empty response.");
      }

      const questions = validateQuestions(
        extractJson(content),
        count
      );

      console.info(
        `Quiz batch generated successfully on attempt ${attempt}/${MAX_BATCH_ATTEMPTS}.`
      );

      return questions;
    } catch (error) {
      previousError =
        error instanceof Error
          ? error.message
          : "Invalid AI response.";

      console.warn(
        `Quiz batch attempt ${attempt}/${MAX_BATCH_ATTEMPTS} failed:`,
        previousError
      );

      if (attempt < MAX_BATCH_ATTEMPTS) {
        console.info(
          "Retrying because the AI response could not be processed."
        );
      }
    }
  }

  throw new Error(
    `Quiz generation failed after ${MAX_BATCH_ATTEMPTS} attempts: ${
      previousError ?? "Unknown error."
    }`
  );
}

async function generateQuestions(
  apiKey: string,
  count: number,
  subjectName: string,
  topicDescription: string,
  difficulty: string
): Promise<GeneratedQuestion[]> {
  const allQuestions: GeneratedQuestion[] = [];
  const seenQuestions = new Set<string>();

  for (let offset = 0; offset < count; offset += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, count - offset);

    let acceptedBatch: GeneratedQuestion[] | null = null;
    let lastDuplicate: string | null = null;

    // Regenerate only when a question repeats.
    // Options are never checked for duplicates.
    for (
      let attempt = 1;
      attempt <= MAX_DUPLICATE_REGENERATIONS;
      attempt++
    ) {
      const excludedQuestions = allQuestions.map(
        (question) => question.question
      );

      if (lastDuplicate) {
        excludedQuestions.push(lastDuplicate);
      }

      const batch = await generateBatch(
        apiKey,
        batchCount,
        subjectName,
        topicDescription,
        difficulty,
        excludedQuestions
      );

      const duplicate = findDuplicateQuestion(
        batch,
        seenQuestions
      );

      if (!duplicate) {
        acceptedBatch = batch;
        break;
      }

      lastDuplicate = duplicate;

      console.warn(
        `Repeated question detected in batch ${Math.floor(offset / BATCH_SIZE) + 1}, regeneration ${attempt}/${MAX_DUPLICATE_REGENERATIONS}:`,
        duplicate
      );
    }

    if (!acceptedBatch) {
      throw new Error(
        `The AI repeatedly generated an existing question: "${lastDuplicate}". Please try generating the quiz again.`
      );
    }

    for (const question of acceptedBatch) {
      seenQuestions.add(normalizeQuestion(question.question));
      allQuestions.push(question);
    }

    console.info(
      `Quiz generation progress: ${allQuestions.length}/${count} questions`
    );
  }

  if (allQuestions.length !== count) {
    throw new Error(
      `Expected ${count} questions but generated ${allQuestions.length}.`
    );
  }

  return allQuestions;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to generate a quiz." }, { status: 401 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "NVIDIA_API_KEY is not configured." }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const subjectId = Number(body.subjectId);
    const topicId = body.topicId == null || body.topicId === "" ? null : Number(body.topicId);
    const difficulty = String(body.difficulty ?? "MEDIUM").toUpperCase();
    const count = Number(body.count ?? 5);

    if (!Number.isSafeInteger(subjectId) || subjectId <= 0) {
      return NextResponse.json({ error: "Choose a valid subject." }, { status: 400 });
    }
    if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return NextResponse.json({ error: "Difficulty must be EASY, MEDIUM, or HARD." }, { status: 400 });
    }
    if (!Number.isInteger(count) || count < 5 || count > 20) {
      return NextResponse.json({ error: "Choose between 5 and 20 questions." }, { status: 400 });
    }

    const [subject] = await db
      .select({ id: quizSubjects.id, name: quizSubjects.name, category: quizSubjects.category })
      .from(quizSubjects)
      .where(and(eq(quizSubjects.id, subjectId), eq(quizSubjects.isActive, true), ne(quizSubjects.category, "CAREER")))
      .limit(1);

    if (!subject) {
      return NextResponse.json({ error: "Subject not found or unavailable in the Quiz Center." }, { status: 404 });
    }

    let topicName: string | null = null;
    if (topicId !== null) {
      if (!Number.isSafeInteger(topicId) || topicId <= 0) {
        return NextResponse.json({ error: "Invalid topic." }, { status: 400 });
      }
      const [topic] = await db
        .select({ id: quizTopics.id, name: quizTopics.name })
        .from(quizTopics)
        .where(and(eq(quizTopics.id, topicId), eq(quizTopics.subjectId, subjectId), eq(quizTopics.isActive, true)))
        .limit(1);
      if (!topic) {
        return NextResponse.json({ error: "Topic does not belong to this subject or is unavailable." }, { status: 400 });
      }
      topicName = topic.name;
    }

    const topicDescription = topicName
      ? `Topic: ${topicName}`
      : "Cover a balanced selection of important topics within the subject.";
    const generatedQuestions = await generateQuestions(apiKey, count, subject.name, topicDescription, difficulty);
    const title = `${subject.name}${topicName ? `: ${topicName}` : ""} — ${difficulty.charAt(0) + difficulty.slice(1).toLowerCase()} Quiz`.slice(0, 200);

    // Neon stores only the quiz's lightweight metadata. Questions and the encrypted
    // answer key are returned to the browser and saved in IndexedDB.
    const [createdQuiz] = await db
      .insert(quizzes)
      .values({
        subjectId,
        topicId,
        title,
        description: `AI-generated ${difficulty.toLowerCase()} quiz on ${subject.name}${topicName ? `: ${topicName}` : ""}.`,
        difficulty,
        quizType: "AI",
        questionCount: generatedQuestions.length,
        isPublished: true,
        createdBy: user.id,
      })
      .returning({ id: quizzes.id, title: quizzes.title });

    const questions = generatedQuestions.map((question, index) => ({
      id: index + 1,
      question: question.question,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      sortOrder: index + 1,
    }));

    const quizToken = encryptQuizPayload({
      version: 1,
      quizId: createdQuiz.id,
      userId: user.id,
      questions: generatedQuestions.map((question, index) => ({
        id: index + 1,
        question: question.question,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctAnswer: question.correctAnswer as "A" | "B" | "C" | "D",
        explanation: question.explanation,
        sortOrder: index + 1,
      })),
    });

    return NextResponse.json({
      saved: true,
      quiz: {
        ...createdQuiz,
        description: `AI-generated ${difficulty.toLowerCase()} quiz on ${subject.name}${topicName ? `: ${topicName}` : ""}.`,
        difficulty,
        quizType: "AI",
        questionCount: questions.length,
        subjectId,
        subjectName: subject.name,
        subjectSlug: subject.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        topicId,
        topicName,
      },
      subject: subject.name,
      topic: topicName,
      difficulty,
      questionCount: questions.length,
      questions,
      quizToken,
    }, { status: 201 });
  } catch (error) {
    console.error("AI quiz generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate quiz. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
