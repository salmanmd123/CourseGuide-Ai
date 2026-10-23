
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { interviewAttempts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

const NVIDIA_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

const DEFAULT_MODEL = "nvidia/nemotron-3.5-lightning-30b-a3b";
const MINIMAX_APTITUDE_MODEL = "minimaxai/minimax-m3.1-flash";

const NVIDIA_TIMEOUT_MS = Math.max(
  10_000,
  Math.min(
    90_000,
    Number(process.env.INTERVIEW_NVIDIA_TIMEOUT_MS) || 65_000
  )
);

const ROUNDS = [
  {
    id: "aptitude",
    title: "Online Assessment",
    detail:
      "Quantitative aptitude, logical reasoning, verbal ability and technical MCQs",
    count: 20,
  },
  {
    id: "coding",
    title: "Technical Coding",
    detail: "Algorithms, data structures, debugging and problem solving",
    count: 4,
  },
  {
    id: "technical",
    title: "Technical Interview",
    detail: "OOP, DBMS, SQL, OS, networking and core CS",
    count: 5,
  },
  {
    id: "project",
    title: "Project / Advanced Technical",
    detail: "Project decisions, architecture, trade-offs and system design",
    count: 4,
  },
  {
    id: "hr",
    title: "HR / Managerial",
    detail: "Introduction, strengths, teamwork and workplace scenarios",
    count: 5,
  },
] as const;

type RoundId = (typeof ROUNDS)[number]["id"];

type AnswerEntry = {
  question: string;
  answer: string;
  // Aptitude: 1 = correct, 0 = incorrect.
  // Other rounds: AI evaluation score from 0 to 100.
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  round: string;
};

type McqCategory =
  | "Quantitative Aptitude"
  | "Logical Reasoning"
  | "Verbal Ability"
  | "Technical MCQs";

type McqQuestion = {
  category: McqCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type SessionData = {
  mode: "round" | "mock";
  roundIds: RoundId[];
  roundIndex: number;
  questionIndex: number;
  currentQuestion: string;
  currentMcq?: McqQuestion;
  mcqQuestions?: McqQuestion[];
  feedbackMode: "each" | "end";
  answers: AnswerEntry[];
  startedAt: string;
  completedAt?: string;
  status: "in_progress" | "completed";
};

function getRound(id: string) {
  return ROUNDS.find((round) => round.id === id);
}

const MCQ_CATEGORIES: McqCategory[] = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Technical MCQs",
];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function isTimeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" ||
      error.name === "AbortError" ||
      /timed out|timeout|aborted due to timeout/i.test(error.message))
  );
}

function getErrorMessage(data: unknown): string {
  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: unknown }).error;

    if (typeof error === "string") {
      return error;
    }

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }
  }

  return "NVIDIA interview API request failed.";
}

function extractJson<T>(text: string): T {
  const cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start < 0 || end <= start) {
    throw new Error(
      "NVIDIA did not return a complete JSON response. Please try again."
    );
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    throw new Error(
      "NVIDIA returned invalid JSON. Please try again."
    );
  }
}

async function askModel(
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[],
  maxTokens = 700,
  jsonMode = false,
  modelOverride?: string
): Promise<string> {
  const apiKey = process.env.NVIDIA_INTERVIEW_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Add NVIDIA_INTERVIEW_API_KEY to your .env.local file to enable Interview Preparation."
    );
  }

  // Only aptitude MCQ generation overrides the model. Other interview
  // rounds continue using INTERVIEW_NVIDIA_MODEL or the existing default.
  const configuredModel = process.env.INTERVIEW_NVIDIA_MODEL;
  const model =
    modelOverride ||
    (configuredModel === MINIMAX_APTITUDE_MODEL
      ? DEFAULT_MODEL
      : configuredModel || DEFAULT_MODEL);

  const isMiniMax = model === MINIMAX_APTITUDE_MODEL;

  const startedAt = Date.now();

  console.info("[Interview AI] Request started", {
    model,
    messageCount: messages.length,
    maxTokens,
    jsonMode,
    timeoutMs: NVIDIA_TIMEOUT_MS,
  });

  let response: Response;

  try {
    response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: isMiniMax ? 0.2 : 0.45,
        top_p: 0.9,
        max_tokens: maxTokens,
        stream: false,
        ...(jsonMode
          ? {
              response_format: {
                type: "json_object",
              },
            }
          : {}),
        // Nemotron-specific template settings are intentionally omitted for
        // MiniMax because model-specific template parameters may differ.
        ...(!isMiniMax
          ? {
              chat_template_kwargs: {
                enable_thinking: false,
              },
            }
          : {}),
      }),
      signal: AbortSignal.timeout(NVIDIA_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = isTimeoutError(error);

    console.error("[Interview AI] Request failed", {
      durationMs: Date.now() - startedAt,
      errorName:
        error instanceof Error ? error.name : "UnknownError",
      message:
        error instanceof Error ? error.message : String(error),
    });

    if (timedOut) {
      const timeoutError = new Error(
        `NVIDIA did not respond within ${Math.round(
          NVIDIA_TIMEOUT_MS / 1000
        )} seconds. Please try again.`
      );
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }

    throw error;
  }

  const data = await response.json().catch(() => ({}));

  console.info("[Interview AI] Response received", {
    durationMs: Date.now() - startedAt,
    status: response.status,
    ok: response.ok,
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  const choice = data?.choices?.[0];

  if (choice?.finish_reason === "length") {
    throw new Error(
      "NVIDIA truncated its response because the token limit was reached. Please try again."
    );
  }

  const content = choice?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error(
      "NVIDIA returned an empty response. Please try again."
    );
  }

  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();
}

// Generates all 20 aptitude MCQs in one MiniMax request through NVIDIA.
async function generateMcqBatch(
  categories: McqCategory[],
  countPerCategory: number,
  seed: string,
  excludedQuestions: string[] = []
): Promise<McqQuestion[]> {
  const total = categories.length * countPerCategory;

  const exclusionList = excludedQuestions
    .map((question, index) => `${index + 1}. ${question}`)
    .join("\\n")
    .slice(0, 18000);

  const prompt = `
Generate exactly ${total} FRESH, original campus-placement MCQs for entry-level computer science candidates.

IMPORTANT NOVELTY REQUIREMENT:
The candidate has already seen the questions listed under "PREVIOUSLY USED QUESTIONS".
Do not repeat any of them. Do not lightly paraphrase them. Do not reuse the same question structure with only names, numbers, dates, objects, or words changed.
For example, if a previous question asks for the average after one student leaves and another joins, do not ask the same average-replacement problem with different ages. Choose a genuinely different concept or reasoning pattern.
For numerical questions, change both the underlying scenario and the mathematical setup, not just the values. For verbal questions, avoid the same sentence, target word, grammar error, or answer choices. For technical questions, avoid asking the same fact/concept in a near-identical form.
Within this 20-question batch, every question must test a distinct problem or concept. Avoid repeated templates across categories too.
Use the previous questions as a strict exclusion list, not as examples to imitate.

Return one valid JSON object only, with this exact structure:
{"questions":[{"category":"Quantitative Aptitude","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}

Generate exactly ${countPerCategory} questions for each category, in this order:
1. Questions 1-${countPerCategory}: Quantitative Aptitude
2. Questions ${countPerCategory + 1}-${countPerCategory * 2}: Logical Reasoning
3. Questions ${countPerCategory * 2 + 1}-${countPerCategory * 3}: Verbal Ability
4. Questions ${countPerCategory * 3 + 1}-${total}: Technical MCQs

Category requirements:
- Quantitative Aptitude: arithmetic, percentages, ratios, averages, profit/loss, time/work, speed/distance. Percentage questions are allowed.
- Logical Reasoning: sequences, patterns, deductions, arrangements, analytical reasoning.
- Verbal Ability: grammar, vocabulary, sentence correction, fill-in-the-blanks, comprehension.
- Technical MCQs: programming, data structures, algorithms, OOP, SQL/DBMS, operating systems, networking.

QUALITY, ANSWER-KEY ACCURACY, AND OPTION VALIDATION (highest priority; do not sacrifice this for novelty or speed):
- Produce assessment-quality questions that a careful human examiner could verify. Every question must be factually correct, self-contained, precise, and appropriate for entry-level campus placements.
- For EACH item, privately solve it from first principles BEFORE composing the options. Do not guess an answer and then invent a justification.
- Create four distinct, mutually exclusive options. Exactly one option must be correct under the stated conditions. The other three must be clearly wrong, not arguably correct, equivalent in meaning, or dependent on unstated assumptions.
- Set correctIndex to the zero-based index (0, 1, 2, or 3) of the option that is actually correct. After writing all options, read the question and options again and verify the indexed option directly answers the question.
- The explanation must demonstrate why the keyed option is correct. It must agree with correctIndex and the option text. Never let the explanation, answer key, and options contradict one another.
- For calculations: work out the exact answer independently, recompute it using a second check, check units and arithmetic, and confirm the correct answer appears exactly once in the options. Avoid accidental rounding issues unless rounding is explicitly requested. Ensure ratios and totals are mathematically consistent.
- For sequences and patterns: use a clear, defensible rule that yields one answer. Do not use a pattern with multiple equally plausible continuations.
- For logical deductions and seating/arrangement problems: verify that all clues can be satisfied together, that the question contains enough information, and that exactly one listed option follows. If more than one arrangement/answer is possible, rewrite the question.
- For English grammar: provide enough context to make one answer clearly correct in standard contemporary English. Avoid regional or disputed usage, subjective style preferences, and sentences with multiple valid corrections. For vocabulary, ensure the tested word and its intended meaning are used correctly.
- For technical questions: use established, stable computer-science facts. For code, mentally trace the exact code and state the language where behavior depends on language. For complexity questions, specify relevant assumptions (for example, sorted input and worst-case complexity). For SQL, specify semantics when needed. Do not mix language-specific rules or outdated terminology.
- Never fabricate a technical fact, API, output, grammar rule, or definition. If unsure about a fact or cannot prove a unique answer, discard and replace the question with one you can verify confidently.
- Do not use duplicate options, synonymous options, overlapping ranges, “all of the above,” “none of the above,” trick wording, missing constraints, hidden assumptions, or distractors that could also be correct.
- Before returning JSON, run a final audit over EVERY item: (1) question is clear, (2) solve independently, (3) exactly four unique options, (4) exactly one correct option, (5) correctIndex points to it, (6) explanation supports it, (7) no contradiction or missing assumption. Rewrite any item that fails any check.
- Correctness is more important than novelty, variety, or completing the batch quickly. Never keep a questionable item merely to reach the requested count; replace it with a simpler verified item.
- Maintain novelty too: vary concepts and reasoning structures, not merely names, values, or words. Avoid repeats within this batch and against the exclusion list. Use a broad mix of quantitative operations, logical patterns, verbal constructions, and technical subtopics.
- Use these exact category names: ${categories.join(", ")}.
- Do not include IDs, difficulty fields, Markdown, comments, chain-of-thought, or any text outside the JSON. Return only the requested compact JSON object.
- Keep question wording and explanations concise, but never omit information needed to make the answer uniquely correct.
PREVIOUSLY USED QUESTIONS (must not be repeated or closely paraphrased):
${exclusionList || "No prior questions supplied. Still ensure all questions in this batch are novel and distinct."}

Variation seed: ${seed}. Use it only to encourage a different selection of topics and scenarios. Never mention the seed in any question.
`;

  const generatedResponse = await askModel(
    [
      {
        role: "system",
        content:
          "You are a meticulous assessment author and answer-key auditor. Correctness takes priority over speed. Internally solve and verify every MCQ and its options before returning only valid JSON in the requested schema. Never include chain-of-thought or text outside JSON.",
      },
      { role: "user", content: prompt },
    ],
    7000,
    true,
    MINIMAX_APTITUDE_MODEL
  );

  const parsed = extractJson<{ questions: McqQuestion[] }>(
    generatedResponse
  );
  const returnedQuestions = parsed?.questions;

  if (!Array.isArray(returnedQuestions)) {
    throw new Error(
      "MiniMax did not return a valid question list. Please try again."
    );
  }

  // Models sometimes return extra items. Validate candidates, remove exact
  // duplicate wording, then select the required quota from each category.
  const validByCategory = new Map<McqCategory, McqQuestion[]>(
    categories.map((category) => [category, []])
  );
  const seenQuestions = new Set<string>();

  for (const item of returnedQuestions) {
    if (
      !item ||
      !categories.includes(item.category) ||
      typeof item.question !== "string" ||
      !item.question.trim() ||
      !Array.isArray(item.options) ||
      item.options.length !== 4 ||
      item.options.some((option) => typeof option !== "string" || !option.trim()) ||
      new Set(item.options.map((option) => option.trim().toLowerCase())).size !== 4 ||
      !Number.isInteger(item.correctIndex) ||
      item.correctIndex < 0 ||
      item.correctIndex > 3 ||
      typeof item.explanation !== "string" ||
      !item.explanation.trim()
    ) {
      continue;
    }

    const normalizedQuestion = item.question
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
    if (seenQuestions.has(normalizedQuestion)) continue;
    seenQuestions.add(normalizedQuestion);

    validByCategory.get(item.category)!.push({
      ...item,
      question: item.question.trim(),
      options: item.options.map((option) => option.trim()),
      explanation: item.explanation.trim(),
    });
  }

  const selectedQuestions: McqQuestion[] = [];
  const selectedCounts: Record<string, number> = {};

  for (const category of categories) {
    const candidates = shuffle(validByCategory.get(category) ?? []);
    if (candidates.length < countPerCategory) {
      throw new Error(
        `MiniMax returned only ${candidates.length} valid, unique questions for ${category}; need ${countPerCategory}. Please try again.`
      );
    }
    selectedQuestions.push(...candidates.slice(0, countPerCategory));
    selectedCounts[category] = countPerCategory;
  }

  if (selectedQuestions.length !== total) {
    throw new Error(`Could not prepare ${total} valid questions. Please try again.`);
  }

  console.info("[Interview AI] MCQ generation completed", {
    model: MINIMAX_APTITUDE_MODEL,
    requested: total,
    returnedByModel: returnedQuestions.length,
    selected: selectedQuestions.length,
    categories: selectedCounts,
  });

  return shuffle(selectedQuestions);
}

function publicSession(session: SessionData) {
  return session;
}

// Convert internal answer scores into a consistent overall score.
// MCQs use 1/0 internally; other rounds use scores from 0 to 100.
function calculateOverallScore(answers: AnswerEntry[]): number {
  if (!answers.length) return 0;

  const normalizedTotal = answers.reduce((sum, answer) => {
    const normalizedScore =
      answer.round === "aptitude"
        ? answer.score * 100
        : answer.score;

    return sum + normalizedScore;
  }, 0);

  return Math.round(normalizedTotal / answers.length);
}

export async function GET() {
  const startedAt = Date.now();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const rows = await db
      .select({
        status: interviewAttempts.status,
        score: interviewAttempts.score,
        answersReviewed: interviewAttempts.answersReviewed,
      })
      .from(interviewAttempts)
      .where(eq(interviewAttempts.userId, user.id));

    const completed = rows.filter(
      (row) => row.status === "completed"
    );

    return NextResponse.json({
      stats: {
        startedCount: rows.length,
        completedCount: completed.length,
        overallScore: completed.length
          ? Math.round(
              completed.reduce(
                (sum, row) => sum + row.score,
                0
              ) / completed.length
            )
          : 0,
        totalAnswersReviewed: rows.reduce(
          (sum, row) => sum + row.answersReviewed,
          0
        ),
      },
    });
  } catch (error) {
    console.error("[Interview API] Could not load metrics", {
      durationMs: Date.now() - startedAt,
      error,
    });

    return NextResponse.json(
      { error: "Could not load interview metrics." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  let action = "unknown";

  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const body = await request.json();

    action =
      typeof body?.action === "string"
        ? body.action
        : "unknown";

    console.info("[Interview API] Request started", { action });

    // START INTERVIEW
    if (action === "start") {
      const mode: SessionData["mode"] =
        body.mode === "mock" ? "mock" : "round";

      const roundIds: RoundId[] =
        mode === "mock"
          ? ROUNDS.map((round) => round.id)
          : [body.roundId].filter(
              (id): id is RoundId =>
                typeof id === "string" &&
                ROUNDS.some((round) => round.id === id)
            );

      if (!roundIds.length) {
        return NextResponse.json(
          { error: "Choose a valid interview round." },
          { status: 400 }
        );
      }

      const feedbackMode: SessionData["feedbackMode"] =
        body.feedbackMode === "end" ? "end" : "each";

      const session: SessionData = {
        mode,
        roundIds,
        roundIndex: 0,
        questionIndex: 0,
        currentQuestion: "",
        feedbackMode,
        answers: [],
        startedAt: new Date().toISOString(),
        status: "in_progress",
      };

      // Generate all 20 questions in one request.
      if (roundIds[0] === "aptitude") {
        const excludedQuestions = Array.isArray(body.excludedQuestions)
          ? body.excludedQuestions
              .filter((question: unknown): question is string =>
                typeof question === "string" && question.trim().length > 0
              )
              .map((question: string) => question.trim().slice(0, 500))
              .slice(-100)
          : [];

        session.mcqQuestions = await generateMcqBatch(
          MCQ_CATEGORIES,
          5,
          crypto.randomUUID(),
          excludedQuestions
        );
      }

      session.currentQuestion = await nextQuestion(session);

      const [attempt] = await db
        .insert(interviewAttempts)
        .values({
          userId: user.id,
          mode,
          status: "in_progress",
          score: 0,
          answersReviewed: 0,
          startedAt: new Date(session.startedAt),
        })
        .returning({
          id: interviewAttempts.id,
        });

      console.info("[Interview API] Interview started", {
        durationMs: Date.now() - startedAt,
        round: roundIds[0],
        sessionId: attempt.id,
      });

      return NextResponse.json({
        sessionId: attempt.id,
        session: publicSession(session),
        round: getRound(roundIds[0]),
      });
    }

    // ALL OTHER ACTIONS REQUIRE A SESSION AND ATTEMPT.
    const session = body?.session as SessionData | undefined;

    if (
      !session ||
      !Array.isArray(session.roundIds) ||
      !Array.isArray(session.answers) ||
      !session.roundIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "Interview session data is missing. Please restart this practice session.",
        },
        { status: 400 }
      );
    }

    const attemptId = Number(body.sessionId);

    if (!Number.isInteger(attemptId) || attemptId <= 0) {
      return NextResponse.json(
        {
          error:
            "Interview attempt ID is missing. Please restart this session.",
        },
        { status: 400 }
      );
    }

    const [attempt] = await db
      .select({
        id: interviewAttempts.id,
        status: interviewAttempts.status,
      })
      .from(interviewAttempts)
      .where(
        and(
          eq(interviewAttempts.id, attemptId),
          eq(interviewAttempts.userId, user.id)
        )
      );

    if (
      !attempt ||
      attempt.status === "completed" ||
      attempt.status === "abandoned"
    ) {
      return NextResponse.json(
        {
          error: "Interview attempt not found or already ended.",
        },
        { status: 404 }
      );
    }

    // SUBMIT ANSWER
    if (action === "answer") {
      const answer =
        typeof body.answer === "string"
          ? body.answer.trim().slice(0, 12000)
          : "";

      if (!answer) {
        return NextResponse.json(
          {
            error: "Please provide an answer before continuing.",
          },
          { status: 400 }
        );
      }

      const round = getRound(
        session.roundIds[session.roundIndex]
      );

      if (!round) {
        return NextResponse.json(
          { error: "Interview round not found." },
          { status: 400 }
        );
      }

      let evaluation: {
        score: number;
        feedback: string;
        strengths: string[];
        improvements: string[];
      };

      if (round.id === "aptitude") {
        const mcq = session.currentMcq;

        if (!mcq) {
          throw new Error(
            "The current aptitude question is missing. Please restart the round."
          );
        }

        const match = answer.match(/^\s*([A-D])(?:\s*[.)])?/i);

        const selectedIndex = match
          ? match[1].toUpperCase().charCodeAt(0) - 65
          : -1;

        const correct =
          selectedIndex === mcq.correctIndex;

        // No per-question 0% / 100% score.
        // Store correctness internally as 1 or 0.
        evaluation = {
          score: correct ? 1 : 0,
          feedback: correct
            ? `Correct! ${mcq.explanation}`
            : `Incorrect. The correct answer is ${String.fromCharCode(
                65 + mcq.correctIndex
              )}. ${mcq.options[mcq.correctIndex]}. ${mcq.explanation}`,
          strengths: correct
            ? ["Selected the correct option."]
            : [],
          improvements: correct
            ? []
            : [
                "Review the explanation and practise a similar question.",
              ],
        };
      } else {
        const rawEvaluation = await askModel(
          [
            {
              role: "system",
              content: `
You are a fair and experienced interviewer evaluating an entry-level
computer science candidate.

Evaluate the answer based on correctness, relevance, reasoning,
clarity and practical understanding.

Return ONLY valid JSON in this exact structure:
{
  "score": 75,
  "feedback": "Concise constructive feedback in 2-4 sentences.",
  "strengths": ["Strength 1"],
  "improvements": ["Improvement 1"]
}

Requirements:
- score must be an integer from 0 to 100.
- Award credit for correct reasoning even if the wording differs
  from an ideal answer.
- Do not reward length alone.
- Do not penalize a candidate for using a different valid approach.
- Do not claim that code was executed or tested.
- Include up to three strengths and three improvements.
- Keep feedback useful, specific and encouraging.
- Do not add Markdown or text outside the JSON.
`,
            },
            {
              role: "user",
              content: `
Interview round: ${round.title}

Question:
${session.currentQuestion}

Candidate's answer:
${answer}

Evaluate the answer and return the JSON evaluation.
`,
            },
          ],
          900,
          true
        );

        const parsed = extractJson<{
          score: number;
          feedback: string;
          strengths: string[];
          improvements: string[];
        }>(rawEvaluation);

        evaluation = {
          score: Number(parsed.score),
          feedback: String(
            parsed.feedback || "Answer reviewed."
          ),
          strengths: Array.isArray(parsed.strengths)
            ? parsed.strengths.slice(0, 3).map(String)
            : [],
          improvements: Array.isArray(parsed.improvements)
            ? parsed.improvements.slice(0, 3).map(String)
            : [],
        };
      }

      const entry: AnswerEntry = {
        question: session.currentQuestion,
        answer,
        score:
          round.id === "aptitude"
            ? evaluation.score
            : Math.max(
                0,
                Math.min(
                  100,
                  Math.round(
                    Number(evaluation.score) || 0
                  )
                )
              ),
        feedback: String(
          evaluation.feedback || "Answer reviewed."
        ),
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        round: round.id,
      };

      session.answers.push(entry);
      session.questionIndex += 1;

      const roundComplete =
        session.questionIndex >= round.count;

      let roundSummary: string | null = null;

      if (
        roundComplete &&
        session.feedbackMode === "end"
      ) {
        const roundAnswers = session.answers.filter(
          (item) => item.round === round.id
        );

        if (round.id === "aptitude") {
          const correctCount = roundAnswers.filter(
            (item) => item.score === 1
          ).length;

          roundSummary =
            `You answered ${correctCount} out of ${roundAnswers.length} questions correctly. ` +
            "Review the explanations for missed questions and practise similar " +
            "aptitude, reasoning, English and technical MCQs to improve speed and accuracy.";
        } else {
          roundSummary = await askModel(
            [
              {
                role: "system",
                content: `
Summarize the candidate's performance in this interview round
in three concise sentences:
1. What went well.
2. The main area for improvement.
3. One practical next step.

Be encouraging, specific and constructive.
Do not return JSON or Markdown.
`,
              },
              {
                role: "user",
                content: JSON.stringify({
                  round: round.title,
                  answers: roundAnswers.map(
                    ({
                      question,
                      answer,
                      score,
                      feedback,
                    }) => ({
                      question,
                      answer,
                      score,
                      feedback,
                    })
                  ),
                }),
              },
            ],
            220
          );
        }
      }

      if (roundComplete) {
        session.roundIndex += 1;
        session.questionIndex = 0;
      }

      const finished =
        session.roundIndex >= session.roundIds.length;

      if (finished) {
        session.status = "completed";
        session.completedAt = new Date().toISOString();
      }

      const scoreSoFar = calculateOverallScore(
        session.answers
      );

      await db
        .update(interviewAttempts)
        .set({
          score: scoreSoFar,
          answersReviewed: session.answers.length,
          status: finished ? "completed" : "in_progress",
          completedAt: finished
            ? new Date(
                session.completedAt || new Date().toISOString()
              )
            : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(interviewAttempts.id, attemptId),
            eq(interviewAttempts.userId, user.id)
          )
        );

      if (finished) {
        console.info("[Interview API] Interview completed", {
          durationMs: Date.now() - startedAt,
          sessionId: attemptId,
          answersReviewed: session.answers.length,
        });

        return NextResponse.json({
          evaluation: entry,
          roundComplete,
          roundSummary,
          finished: true,
          session: publicSession(session),
          round: null,
        });
      }

      const nextRound = getRound(
        session.roundIds[session.roundIndex]
      );

      session.currentQuestion = await nextQuestion(session);

      console.info("[Interview API] Next question ready", {
        durationMs: Date.now() - startedAt,
        sessionId: attemptId,
        round: nextRound?.id,
        questionIndex: session.questionIndex,
      });

      return NextResponse.json({
        evaluation: entry,
        roundComplete,
        roundSummary,
        finished: false,
        session: publicSession(session),
        round: nextRound,
      });
    }

    // FINISH / ABANDON INTERVIEW
    if (action === "finish") {
      const scoreSoFar = calculateOverallScore(
        session.answers
      );

      await db
        .update(interviewAttempts)
        .set({
          score: scoreSoFar,
          answersReviewed: session.answers.length,
          status: "abandoned",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(interviewAttempts.id, attemptId),
            eq(interviewAttempts.userId, user.id)
          )
        );

      session.status = "completed";
      session.completedAt = new Date().toISOString();

      return NextResponse.json({
        finished: true,
        session: publicSession(session),
      });
    }

    return NextResponse.json(
      { error: "Unknown interview action." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Interview request failed.";

    const timedOut = isTimeoutError(error);

    console.error("[Interview API] Request failed", {
      action,
      durationMs: Date.now() - startedAt,
      errorName:
        error instanceof Error ? error.name : "UnknownError",
      message,
    });

    return NextResponse.json(
      { error: message },
      { status: timedOut ? 504 : 500 }
    );
  }
}

async function nextQuestion(
  session: SessionData
): Promise<string> {
  const roundId = session.roundIds[session.roundIndex];
  const round = getRound(roundId);

  if (!round) {
    throw new Error("Interview round not found.");
  }

  if (roundId === "aptitude") {
    const item = session.mcqQuestions?.[session.questionIndex];

    if (!item) {
      throw new Error(
        "No more online assessment questions are available."
      );
    }

    session.currentMcq = item;
    return item.question;
  }

  session.currentMcq = undefined;

  const previous = session.answers
    .filter((answer) => answer.round === roundId)
    .map((answer) => answer.question)
    .slice(-8);

  const question = await askModel(
    [
      {
        role: "system",
        content: `
You are a realistic, professional and encouraging CSE placement interviewer.

Ask exactly ONE interview question.
Do not answer the question.
Do not add an introduction, preamble, markdown, numbering or multiple questions.

Round: ${round.title}
Scope: ${round.detail}

The candidate is preparing for entry-level software engineering placements.

For the coding round:
- Ask one clear DSA or programming problem.
- Include useful constraints and expected input/output.
- Ensure the problem is solvable and appropriately scoped.

For technical interviews:
- Ask practical questions that test understanding, not memorization alone.

For project interviews:
- Ask about decisions, architecture, trade-offs, implementation and challenges.

For HR interviews:
- Ask realistic behavioral or workplace questions.

Avoid repeating these questions:
${previous.join("\n") || "None so far."}

Return only the next question.
`,
      },
      {
        role: "user",
        content: `
Generate question ${session.questionIndex + 1}
for the ${round.title} round.

Interview mode: ${
          session.mode === "mock"
            ? "Complete five-round mock interview"
            : "Individual round practice"
        }.
`,
      },
    ],
    400
  );

  return question
    .replace(/^\s*(?:question\s*\d*\s*[:.)-]\s*)/i, "")
    .trim();
}
