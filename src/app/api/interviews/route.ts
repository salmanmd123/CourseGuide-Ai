
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
  correctedCode?: string;
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

type CodingQuestion = { id: string; category: string; difficulty: string; question: string };

type SessionData = {
  mode: "round" | "mock";
  roundIds: RoundId[];
  roundIndex: number;
  questionIndex: number;
  currentQuestion: string;
  codingQuestions?: CodingQuestion[];
  currentCodingQuestion?: CodingQuestion;
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
    console.error("[Interview AI] Response truncated", {
      model,
      maxTokens,
      jsonMode,
    });
    throw new Error(
      `NVIDIA truncated its response at the ${maxTokens}-token output limit. Please retry; coding evaluations use a larger output limit to include corrected code.`
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
const CODING_QUESTION_BANK: CodingQuestion[] = [
  {
    "id": "PF001",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Check whether a number is even or odd."
  },
  {
    "id": "PF002",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Check whether a number is positive, negative, or zero."
  },
  {
    "id": "PF003",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Find the largest of three numbers."
  },
  {
    "id": "PF004",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Swap two numbers."
  },
  {
    "id": "PF005",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Calculate the factorial of a number."
  },
  {
    "id": "PF006",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Print the Fibonacci series up to N terms."
  },
  {
    "id": "PF007",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Check whether a number is prime."
  },
  {
    "id": "PF008",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Print all prime numbers in a given range."
  },
  {
    "id": "PF009",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Find the sum of digits of a number."
  },
  {
    "id": "PF010",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Reverse an integer."
  },
  {
    "id": "PF011",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Check whether an integer is a palindrome."
  },
  {
    "id": "PF012",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Count the digits in an integer."
  },
  {
    "id": "PF013",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Find the GCD of two numbers."
  },
  {
    "id": "PF014",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Find the LCM of two numbers."
  },
  {
    "id": "PF015",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Check whether a number is an Armstrong number."
  },
  {
    "id": "PF016",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Check whether a number is a perfect number."
  },
  {
    "id": "PF017",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Convert decimal to binary."
  },
  {
    "id": "PF018",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Calculate x^n without using a built-in power function."
  },
  {
    "id": "PF019",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Print a multiplication table for a given number."
  },
  {
    "id": "PF020",
    "category": "Programming fundamentals",
    "difficulty": "Beginner",
    "question": "Find the sum of all integers from 1 to N."
  },
  {
    "id": "PAT001",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a right-angled triangle using *."
  },
  {
    "id": "PAT002",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print an inverted right-angled triangle."
  },
  {
    "id": "PAT003",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a pyramid pattern."
  },
  {
    "id": "PAT004",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print an inverted pyramid."
  },
  {
    "id": "PAT005",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a diamond pattern."
  },
  {
    "id": "PAT006",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a hollow square."
  },
  {
    "id": "PAT007",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print Floyd's triangle."
  },
  {
    "id": "PAT008",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print Pascal's triangle."
  },
  {
    "id": "PAT009",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a number triangle where each row repeats its row number."
  },
  {
    "id": "PAT010",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a triangle with consecutive numbers."
  },
  {
    "id": "PAT011",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a binary triangle using alternating 0s and 1s."
  },
  {
    "id": "PAT012",
    "category": "Pattern programming",
    "difficulty": "Beginner",
    "question": "Print a butterfly pattern using stars."
  },
  {
    "id": "ARR001",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the largest element in an array."
  },
  {
    "id": "ARR002",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the smallest element in an array."
  },
  {
    "id": "ARR003",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the second-largest distinct element."
  },
  {
    "id": "ARR004",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the Kth-largest element."
  },
  {
    "id": "ARR005",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Calculate the sum and average of array elements."
  },
  {
    "id": "ARR006",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Reverse an array in place."
  },
  {
    "id": "ARR007",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Check whether an array is sorted."
  },
  {
    "id": "ARR008",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Remove duplicates from a sorted array."
  },
  {
    "id": "ARR009",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Move all zeros to the end of an array."
  },
  {
    "id": "ARR010",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Move all negative numbers to one side."
  },
  {
    "id": "ARR011",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the missing number from 1 to N."
  },
  {
    "id": "ARR012",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the element that appears only once when all others appear twice."
  },
  {
    "id": "ARR013",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find all duplicate elements in an array."
  },
  {
    "id": "ARR014",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the frequency of each array element."
  },
  {
    "id": "ARR015",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Rotate an array to the left by K positions."
  },
  {
    "id": "ARR016",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Rotate an array to the right by K positions."
  },
  {
    "id": "ARR017",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Merge two sorted arrays."
  },
  {
    "id": "ARR018",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the intersection of two arrays."
  },
  {
    "id": "ARR019",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the union of two arrays."
  },
  {
    "id": "ARR020",
    "category": "Arrays",
    "difficulty": "Beginner to intermediate",
    "question": "Find the maximum sum of a contiguous subarray."
  },
  {
    "id": "STR001",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Reverse a string."
  },
  {
    "id": "STR002",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Check whether a string is a palindrome."
  },
  {
    "id": "STR003",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Count vowels and consonants."
  },
  {
    "id": "STR004",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Count the number of words in a sentence."
  },
  {
    "id": "STR005",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Count the frequency of each character."
  },
  {
    "id": "STR006",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Find the first non-repeating character."
  },
  {
    "id": "STR007",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Find the first repeating character."
  },
  {
    "id": "STR008",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Remove duplicate characters from a string."
  },
  {
    "id": "STR009",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Check whether two strings are anagrams."
  },
  {
    "id": "STR010",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Check whether one string is a rotation of another."
  },
  {
    "id": "STR011",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Reverse the order of words in a sentence."
  },
  {
    "id": "STR012",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Reverse each word while preserving word order."
  },
  {
    "id": "STR013",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Find the longest word in a sentence."
  },
  {
    "id": "STR014",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Find the most frequent character."
  },
  {
    "id": "STR015",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Remove all whitespace from a string."
  },
  {
    "id": "STR016",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Convert lowercase letters to uppercase without a built-in conversion function."
  },
  {
    "id": "STR017",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Find all character positions of a given letter."
  },
  {
    "id": "STR018",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Check whether a string contains only digits."
  },
  {
    "id": "STR019",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Find the longest common prefix in an array of strings."
  },
  {
    "id": "STR020",
    "category": "String programming",
    "difficulty": "Beginner to intermediate",
    "question": "Find the longest substring without repeating characters."
  },
  {
    "id": "SS001",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Implement linear search."
  },
  {
    "id": "SS002",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Implement binary search on a sorted array."
  },
  {
    "id": "SS003",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Find the first and last occurrence of a target in a sorted array."
  },
  {
    "id": "SS004",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Implement bubble sort."
  },
  {
    "id": "SS005",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Implement selection sort."
  },
  {
    "id": "SS006",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Implement insertion sort."
  },
  {
    "id": "SS007",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Implement merge sort."
  },
  {
    "id": "SS008",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Implement quicksort."
  },
  {
    "id": "SS009",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Search for an element in a rotated sorted array."
  },
  {
    "id": "SS010",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Find the insertion position of a target in a sorted array."
  },
  {
    "id": "SS011",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Find the square root of an integer using binary search."
  },
  {
    "id": "SS012",
    "category": "Searching and sorting",
    "difficulty": "Beginner to intermediate",
    "question": "Sort an array containing only 0s, 1s, and 2s."
  },
  {
    "id": "HT001",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Solve the Two Sum problem."
  },
  {
    "id": "HT002",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find all pairs whose sum equals a target."
  },
  {
    "id": "HT003",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find all triplets whose sum equals zero."
  },
  {
    "id": "HT004",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find the longest consecutive sequence in an array."
  },
  {
    "id": "HT005",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find the majority element appearing more than N/2 times."
  },
  {
    "id": "HT006",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find the subarray with a sum equal to K."
  },
  {
    "id": "HT007",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Count subarrays whose sum equals K."
  },
  {
    "id": "HT008",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find the longest subarray with an equal number of 0s and 1s."
  },
  {
    "id": "HT009",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find the pair with the smallest absolute difference."
  },
  {
    "id": "HT010",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find the container that holds the most water."
  },
  {
    "id": "HT011",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Find the triplet whose sum is closest to a target."
  },
  {
    "id": "HT012",
    "category": "Hashing and two-pointer problems",
    "difficulty": "Intermediate",
    "question": "Calculate the product of an array except for each element's own position."
  },
  {
    "id": "REC001",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Calculate factorial using recursion."
  },
  {
    "id": "REC002",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Generate Fibonacci numbers using recursion."
  },
  {
    "id": "REC003",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Find the sum of digits recursively."
  },
  {
    "id": "REC004",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Reverse a string using recursion."
  },
  {
    "id": "REC005",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Calculate x^n using recursive exponentiation."
  },
  {
    "id": "REC006",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Generate all subsets of an array."
  },
  {
    "id": "REC007",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Generate all permutations of a string."
  },
  {
    "id": "REC008",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Solve the Tower of Hanoi problem."
  },
  {
    "id": "REC009",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Solve the N-Queens problem."
  },
  {
    "id": "REC010",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Find all combinations of numbers that sum to a target."
  },
  {
    "id": "REC011",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Solve a Sudoku puzzle using backtracking."
  },
  {
    "id": "REC012",
    "category": "Recursion and backtracking",
    "difficulty": "Beginner to advanced",
    "question": "Find a path through a maze with blocked cells."
  },
  {
    "id": "LL001",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Implement a singly linked list."
  },
  {
    "id": "LL002",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Insert a node at the beginning, end, or a given position."
  },
  {
    "id": "LL003",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Delete a node by value."
  },
  {
    "id": "LL004",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Reverse a singly linked list."
  },
  {
    "id": "LL005",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Find the middle node of a linked list."
  },
  {
    "id": "LL006",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Detect a cycle in a linked list."
  },
  {
    "id": "LL007",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Find the starting node of a cycle."
  },
  {
    "id": "LL008",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Merge two sorted linked lists."
  },
  {
    "id": "LL009",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Remove the Nth node from the end."
  },
  {
    "id": "LL010",
    "category": "Linked lists",
    "difficulty": "Intermediate",
    "question": "Check whether a linked list is a palindrome."
  },
  {
    "id": "SQ001",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Implement a stack using an array."
  },
  {
    "id": "SQ002",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Implement a queue using an array."
  },
  {
    "id": "SQ003",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Implement a queue using two stacks."
  },
  {
    "id": "SQ004",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Implement a stack using two queues."
  },
  {
    "id": "SQ005",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Check whether parentheses are balanced."
  },
  {
    "id": "SQ006",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Evaluate a postfix expression."
  },
  {
    "id": "SQ007",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Convert an infix expression to postfix notation."
  },
  {
    "id": "SQ008",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Find the next greater element for each array element."
  },
  {
    "id": "SQ009",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Find the maximum element in every sliding window of size K."
  },
  {
    "id": "SQ010",
    "category": "Stacks and queues",
    "difficulty": "Intermediate",
    "question": "Design a Min Stack that supports retrieving the minimum in constant time."
  },
  {
    "id": "TREE001",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Implement inorder, preorder, and postorder traversal."
  },
  {
    "id": "TREE002",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Implement level-order traversal of a binary tree."
  },
  {
    "id": "TREE003",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Find the maximum depth of a binary tree."
  },
  {
    "id": "TREE004",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Count the leaf nodes in a binary tree."
  },
  {
    "id": "TREE005",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Check whether two binary trees are identical."
  },
  {
    "id": "TREE006",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Check whether a binary tree is height-balanced."
  },
  {
    "id": "TREE007",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Find the diameter of a binary tree."
  },
  {
    "id": "TREE008",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Find the lowest common ancestor of two nodes."
  },
  {
    "id": "TREE009",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Validate whether a binary tree is a binary search tree."
  },
  {
    "id": "TREE010",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Search for a value in a binary search tree."
  },
  {
    "id": "TREE011",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Insert and delete nodes in a binary search tree."
  },
  {
    "id": "TREE012",
    "category": "Trees and binary search trees",
    "difficulty": "Intermediate to advanced",
    "question": "Serialize and deserialize a binary tree."
  },
  {
    "id": "MAT001",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Add two matrices."
  },
  {
    "id": "MAT002",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Multiply two matrices."
  },
  {
    "id": "MAT003",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Find the transpose of a matrix."
  },
  {
    "id": "MAT004",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Rotate a square matrix by 90 degrees."
  },
  {
    "id": "MAT005",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Print a matrix in spiral order."
  },
  {
    "id": "MAT006",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Search for an element in a row-wise and column-wise sorted matrix."
  },
  {
    "id": "MAT007",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Find the sum of the primary and secondary diagonals."
  },
  {
    "id": "MAT008",
    "category": "Matrix problems",
    "difficulty": "Beginner to intermediate",
    "question": "Set an entire row and column to zero if a matrix element is zero."
  },
  {
    "id": "GRAPH001",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Represent a graph using an adjacency list."
  },
  {
    "id": "GRAPH002",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Implement breadth-first search (BFS)."
  },
  {
    "id": "GRAPH003",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Implement depth-first search (DFS)."
  },
  {
    "id": "GRAPH004",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Count the number of connected components in an undirected graph."
  },
  {
    "id": "GRAPH005",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Detect a cycle in an undirected graph."
  },
  {
    "id": "GRAPH006",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Detect a cycle in a directed graph."
  },
  {
    "id": "GRAPH007",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Find the shortest path in an unweighted graph."
  },
  {
    "id": "GRAPH008",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Implement Dijkstra's shortest-path algorithm."
  },
  {
    "id": "GRAPH009",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Find a topological ordering of a directed acyclic graph."
  },
  {
    "id": "GRAPH010",
    "category": "Graph algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Count the number of islands in a binary grid."
  },
  {
    "id": "DP001",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Find the Nth Fibonacci number using dynamic programming."
  },
  {
    "id": "DP002",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Solve the climbing stairs problem."
  },
  {
    "id": "DP003",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Solve the house robber problem."
  },
  {
    "id": "DP004",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Find the minimum number of coins needed to make a given amount."
  },
  {
    "id": "DP005",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Solve the 0/1 knapsack problem."
  },
  {
    "id": "DP006",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Find the longest common subsequence of two strings."
  },
  {
    "id": "DP007",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Find the longest increasing subsequence."
  },
  {
    "id": "DP008",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Find the edit distance between two strings."
  },
  {
    "id": "DP009",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Find the minimum path sum in a grid."
  },
  {
    "id": "DP010",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Count the number of ways to make a target sum."
  },
  {
    "id": "DP011",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Find the maximum product of a contiguous subarray."
  },
  {
    "id": "DP012",
    "category": "Dynamic programming",
    "difficulty": "Intermediate to advanced",
    "question": "Determine whether an array can be partitioned into two subsets with equal sums."
  },
  {
    "id": "GR001",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Select the maximum number of non-overlapping activities."
  },
  {
    "id": "GR002",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Find the minimum number of meeting rooms required."
  },
  {
    "id": "GR003",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Merge overlapping intervals."
  },
  {
    "id": "GR004",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Find the minimum number of platforms required for trains."
  },
  {
    "id": "GR005",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Solve the fractional knapsack problem."
  },
  {
    "id": "GR006",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Find the minimum number of jumps needed to reach the end of an array."
  },
  {
    "id": "GR007",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Determine whether you can complete a circular gas-station journey."
  },
  {
    "id": "GR008",
    "category": "Greedy algorithms",
    "difficulty": "Intermediate to advanced",
    "question": "Schedule jobs to maximize profit before their deadlines."
  },
  {
    "id": "BIT001",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Check whether a number is a power of two."
  },
  {
    "id": "BIT002",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Count the set bits in an integer."
  },
  {
    "id": "BIT003",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Find the unique element when every other element appears twice."
  },
  {
    "id": "BIT004",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Find two unique elements when every other element appears twice."
  },
  {
    "id": "BIT005",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Check whether the Kth bit is set."
  },
  {
    "id": "BIT006",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Set, clear, and toggle the Kth bit."
  },
  {
    "id": "BIT007",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Generate all subsets of a set using bit masks."
  },
  {
    "id": "BIT008",
    "category": "Bit manipulation",
    "difficulty": "Intermediate",
    "question": "Find the missing number using XOR."
  },
  {
    "id": "ADV001",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Find the median of two sorted arrays."
  },
  {
    "id": "ADV002",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Find the largest rectangle in a histogram."
  },
  {
    "id": "ADV003",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Find the maximum rectangle of 1s in a binary matrix."
  },
  {
    "id": "ADV004",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Implement an LRU cache."
  },
  {
    "id": "ADV005",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Find the smallest substring containing all characters of a target string."
  },
  {
    "id": "ADV006",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Find the K most frequent elements in an array."
  },
  {
    "id": "ADV007",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Merge K sorted linked lists."
  },
  {
    "id": "ADV008",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Find the minimum window substring."
  },
  {
    "id": "ADV009",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Implement a trie with insert, search, and prefix-search operations."
  },
  {
    "id": "ADV010",
    "category": "Advanced interview challenges",
    "difficulty": "Advanced",
    "question": "Find the shortest transformation sequence between two words using BFS."
  }
];

/**
 * Turn the short bank title into a candidate-facing prompt. Keep the original
 * bank title intact for IDs, selection, evaluation and the Explain Question API.
 * Each prompt contains only the task and one compact example (no requirements).
 */
function formatCodingQuestion(item: CodingQuestion): string {
  const title = item.question.trim().replace(/[.!?]+$/, "");
  const examples: Record<string, string> = {
    PF001: "Input: 7\nOutput: Odd",
    PF002: "Input: -4\nOutput: Negative",
    PF003: "Input: 4 9 2\nOutput: 9",
    PF004: "Input: a = 3, b = 8\nOutput: a = 8, b = 3",
    PF005: "Input: 5\nOutput: 120",
    PF006: "Input: 6\nOutput: 0 1 1 2 3 5",
    PF007: "Input: 7\nOutput: Prime",
    PF008: "Input: 10 20\nOutput: 11 13 17 19",
    PF009: "Input: 482\nOutput: 14",
    PF010: "Input: 1234\nOutput: 4321",
    PF011: "Input: 1221\nOutput: true",
    PF012: "Input: 9087\nOutput: 4",
    PF013: "Input: 18 24\nOutput: 6",
    PF014: "Input: 4 6\nOutput: 12",
    PF015: "Input: 153\nOutput: true",
    PF016: "Input: 6\nOutput: true",
    PF017: "Input: 10\nOutput: 1010",
    PF018: "Input: x = 2, n = 5\nOutput: 32",
    PF019: "Input: 3\nOutput: 3, 6, 9, ... 30",
    PF020: "Input: 5\nOutput: 15",
    ARR001: "Input: [3, 9, 2, 7]\nOutput: 9",
    ARR002: "Input: [3, 9, 2, 7]\nOutput: 2",
    ARR003: "Input: [4, 1, 7, 7, 5]\nOutput: 5",
    ARR004: "Input: [3, 2, 1, 5, 6, 4], k = 2\nOutput: 5",
    ARR005: "Input: [2, 4, 6]\nOutput: Sum = 12, Average = 4",
    ARR006: "Input: [1, 2, 3, 4]\nOutput: [4, 3, 2, 1]",
    ARR007: "Input: [1, 2, 3, 5]\nOutput: true",
    ARR008: "Input: [1, 1, 2, 2, 3]\nOutput: [1, 2, 3]",
    ARR009: "Input: [0, 1, 0, 3, 12]\nOutput: [1, 3, 12, 0, 0]",
    ARR010: "Input: [-1, 3, -2, 4]\nOutput: [-1, -2, 3, 4] (one valid result)",
    ARR011: "Input: [1, 2, 4, 5], N = 5\nOutput: 3",
    ARR012: "Input: [4, 1, 2, 1, 2]\nOutput: 4",
    ARR013: "Input: [1, 3, 2, 3, 4, 1]\nOutput: [1, 3]",
    ARR014: "Input: [1, 2, 1, 3, 2, 1]\nOutput: 1: 3, 2: 2, 3: 1",
    ARR015: "Input: [1, 2, 3, 4, 5], k = 2\nOutput: [3, 4, 5, 1, 2]",
    ARR016: "Input: [1, 2, 3, 4, 5], k = 2\nOutput: [4, 5, 1, 2, 3]",
    ARR017: "Input: [1, 3, 5] and [2, 4, 6]\nOutput: [1, 2, 3, 4, 5, 6]",
    ARR018: "Input: [1, 2, 3] and [2, 3, 4]\nOutput: [2, 3]",
    ARR019: "Input: [1, 2, 3] and [2, 3, 4]\nOutput: [1, 2, 3, 4]",
    ARR020: "Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6",
    STR001: "Input: \"hello\"\nOutput: \"olleh\"",
    STR002: "Input: \"level\"\nOutput: true",
    STR003: "Input: \"hello\"\nOutput: Vowels = 2, Consonants = 3",
    STR004: "Input: \"Hello world again\"\nOutput: 3",
    STR005: "Input: \"aba\"\nOutput: a: 2, b: 1",
    STR006: "Input: \"swiss\"\nOutput: \"w\"",
    STR007: "Input: \"swiss\"\nOutput: \"s\"",
    STR008: "Input: \"programming\"\nOutput: \"progamin\" (preserving first occurrences)",
    STR009: "Input: \"listen\", \"silent\"\nOutput: true",
    STR010: "Input: \"waterbottle\", \"erbottlewat\"\nOutput: true",
    STR011: "Input: \"learn to code\"\nOutput: \"code to learn\"",
    STR012: "Input: \"hello world\"\nOutput: \"olleh dlrow\"",
    STR013: "Input: \"I love programming\"\nOutput: \"programming\"",
    STR014: "Input: \"banana\"\nOutput: \"a\"",
    STR015: "Input: \"a b\\tc\"\nOutput: \"abc\"",
    STR016: "Input: \"hello\"\nOutput: \"HELLO\"",
    STR017: "Input: text = \"banana\", letter = \"a\"\nOutput: [1, 3, 5]",
    STR018: "Input: \"12345\"\nOutput: true",
    STR019: "Input: [\"flower\", \"flow\", \"flight\"]\nOutput: \"fl\"",
    STR020: "Input: \"abcabcbb\"\nOutput: 3",
    BIT001: "Input: 16\nOutput: true",
    BIT002: "Input: 13\nOutput: 3",
    BIT003: "Input: [4, 1, 2, 1, 2]\nOutput: 4",
    BIT004: "Input: [1, 2, 1, 3, 2, 5]\nOutput: [3, 5]",
    BIT005: "Input: number = 10, k = 1\nOutput: true",
    BIT006: "Input: number = 10, k = 1\nOutput: Set = 10, Clear = 8, Toggle = 8 (0-based bit index)",
    BIT007: "Input: [a, b]\nOutput: [], [a], [b], [a, b]",
    BIT008: "Input: [1, 2, 4, 5], N = 5\nOutput: 3",
    MAT001: "Input: [[1, 2], [3, 4]] and [[5, 6], [7, 8]]\nOutput: [[6, 8], [10, 12]]",
    MAT003: "Input: [[1, 2, 3], [4, 5, 6]]\nOutput: [[1, 4], [2, 5], [3, 6]]",
    MAT004: "Input: [[1, 2], [3, 4]]\nOutput: [[3, 1], [4, 2]]",
    MAT005: "Input: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nOutput: [1, 2, 3, 6, 9, 8, 7, 4, 5]",
    MAT007: "Input: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nOutput: Primary = 15, Secondary = 15",
    GRAPH002: "Input: edges (0-1, 0-2, 1-3), start = 0\nOutput: 0 1 2 3 (one valid BFS order)",
    GRAPH003: "Input: edges (0-1, 0-2, 1-3), start = 0\nOutput: 0 1 3 2 (one valid DFS order)",
    DP001: "Input: N = 6\nOutput: 8 (using F(0) = 0, F(1) = 1)",
    DP002: "Input: n = 4 steps\nOutput: 5",
    DP003: "Input: [2, 7, 9, 3, 1]\nOutput: 12",
    DP006: "Input: \"abcde\", \"ace\"\nOutput: 3",
    DP007: "Input: [10, 9, 2, 5, 3, 7, 101, 18]\nOutput: 4",
    DP008: "Input: \"horse\", \"ros\"\nOutput: 3",
    DP009: "Input: [[1, 3, 1], [1, 5, 1], [4, 2, 1]]\nOutput: 7",
    DP011: "Input: [2, 3, -2, 4]\nOutput: 6",
    GR003: "Input: [[1, 3], [2, 6], [8, 10], [15, 18]]\nOutput: [[1, 6], [8, 10], [15, 18]]",
    ADV006: "Input: [1, 1, 1, 2, 2, 3], k = 2\nOutput: [1, 2]",
  };

  const example = examples[item.id] ?? buildFallbackExample(item);
  return `## Your question\nWrite a program to ${title.charAt(0).toLowerCase()}${title.slice(1)}.\n\n## Example\n\`\`\`text\n${example}\n\`\`\``;
}

function buildFallbackExample(item: CodingQuestion): string {
  // Keep the fallback honest and simple for less common problem types: show a
  // representative operation/output shape without adding a requirements section.
  const category = item.category.toLowerCase();
  if (category.includes("pattern")) return "Input: N = 3\nOutput:\n*\n**\n***";
  if (category.includes("string")) return 'Input: "hello"\nOutput: "hello"';
  if (category.includes("matrix")) return "Input: [[1, 2], [3, 4]]\nOutput: [[1, 2], [3, 4]]";
  if (category.includes("tree") || category.includes("linked list")) return "Input: 1 -> 2 -> 3\nOutput: 1 -> 2 -> 3";
  if (category.includes("graph")) return "Input: vertices = 4, edges = [(0,1), (1,2)]\nOutput: depends on the requested traversal or graph operation";
  if (category.includes("dynamic programming")) return "Input: [1, 2, 3]\nOutput: the value requested by the problem";
  if (category.includes("array") || category.includes("hashing") || category.includes("searching")) return "Input: [1, 2, 3, 4]\nOutput: the result of the requested operation";
  return "Input: a small valid value for the problem\nOutput: the expected result of the requested operation";
}

function selectCodingQuestions(count = 4): CodingQuestion[] {
  return shuffle(CODING_QUESTION_BANK).slice(0, Math.min(count, CODING_QUESTION_BANK.length));
}

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

      // Select four unique coding questions once for this interview session.
      if (roundIds.includes("coding")) {
        session.codingQuestions = selectCodingQuestions(4);
      }

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

    // EXPLAIN CODING QUESTION WITHOUT REVEALING THE SOLUTION
    if (action === "explain") {
      const roundId = session.roundIds[session.roundIndex];
      const current = session.currentCodingQuestion;
      const bankQuestion = current
        ? CODING_QUESTION_BANK.find((item) => item.id === current.id)
        : undefined;
      if (roundId !== "coding" || !bankQuestion) {
        return NextResponse.json({ error: "There is no coding question to explain right now." }, { status: 400 });
      }
      const explanation = await askModel([
        { role: "system", content: `You are a patient beginner-friendly coding interview tutor. Explain what the question is asking in simple language. Clarify important terms and the goal, and offer 2-3 gentle guiding questions the learner can think about. Do NOT provide the answer, algorithm, solution steps, pseudocode, code, or complexity analysis. Do not invent input/output constraints that are not in the original prompt. Keep it concise and supportive. If the task is already simple, restate it in plain language and explain what a successful result should mean without describing how to implement it.` },
        { role: "user", content: `Explain this exact coding question without solving it.
Question ID: ${bankQuestion.id}
Category: ${bankQuestion.category}
Difficulty: ${bankQuestion.difficulty}
Exact question: ${bankQuestion.question}` },
      ], 350);
      return NextResponse.json({ explanation });
    }

    // SUBMIT ANSWER
    if (action === "answer") {
      const answer =
        typeof body.answer === "string"
          ? body.answer.trim().slice(0, 12000)
          : "";
      const supportedLanguages = ["C", "C++", "C#", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "PHP", "Ruby", "Kotlin", "Swift", "SQL"];
      const requestedLanguage = typeof body.language === "string" ? body.language.trim() : "";
      const codingLanguage = supportedLanguages.includes(requestedLanguage) ? requestedLanguage : "C";

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
        correctedCode?: string;
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
${round.id === "coding" ? `
For a coding answer, use this rubric:
- The candidate-selected programming language is: ${codingLanguage}. Treat this as authoritative even if the code snippet does not make the language obvious.
- If the candidate's code is written in another language, explain that mismatch and provide the corrected example in the selected language: ${codingLanguage}.
- Always provide a corrected, beginner-friendly code example in ${codingLanguage}, including when the candidate submitted only an incomplete attempt or a natural-language description. If they gave no code, show a complete concise solution in ${codingLanguage}.
- Correctness and whether the submitted solution addresses the full problem.
- Algorithmic approach and handling of edge cases.
- Time and auxiliary-space complexity, when relevant.
- Code readability, naming, structure, and language syntax.
- Award partial credit for a sound approach even if the code is incomplete.
- Do not assume code was run. Do not claim compilation or execution results.
- If the candidate provides only an explanation instead of code, assess the explanation fairly and mention what is missing.
- Feedback should name a specific issue or strength where possible.
- Most importantly, teach the candidate how to correct their answer, not only what is wrong.
- In the feedback field, include a short section called "How to do it correctly" after the assessment. Explain the correct logic in plain language.
- Put the full corrected solution in a separate JSON field named "correctedCode". This field must contain ONLY source code, with no Markdown fences or explanation. It is mandatory for coding questions and must be a complete, beginner-friendly solution in ${codingLanguage}. Even if the candidate submitted incorrect code, incomplete code, or only a natural-language description, provide a full correct solution. Never leave correctedCode empty for a coding question unless the question itself cannot reasonably be solved from the provided text.
- For a coding question, base the correction on the exact question and its examples. Do not add unrelated requirements or claim the code was run.
- Each item in improvements must be an actionable fix, ideally describing what to change and how. Avoid generic advice like "practise more" when a concrete correction is possible.
` : ""}

Return ONLY valid JSON in this exact structure:
{
  "score": 75,
  "feedback": "Assessment plus a clear 'How to do it correctly' explanation; for coding answers include a concise corrected code example when possible.",
  "strengths": ["Strength 1"],
  "improvements": ["Specific fix and how to apply it"],
  "correctedCode": "Complete source code only for coding questions; empty string for other rounds"
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

Candidate-selected programming language for this coding question: ${round.id === "coding" ? codingLanguage : "not applicable"}

Candidate's answer:
${answer}

Evaluate the answer and return the JSON evaluation.
`,
            },
          ],
          // Coding evaluations need extra output room for the required
          // correctedCode field; short non-coding feedback can keep the
          // smaller budget.
          round.id === "coding" ? 2200 : 900,
          true
        );

        const parsed = extractJson<{
          score: number;
          feedback: string;
          strengths: string[];
          improvements: string[];
          correctedCode?: string;
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
          correctedCode: round.id === "coding" ? String(parsed.correctedCode || "").trim() : "",
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
        correctedCode: evaluation.correctedCode || "",
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

  if (roundId === "coding") {
    if (!session.codingQuestions?.length) {
      session.codingQuestions = selectCodingQuestions(4);
    }
    const item = session.codingQuestions[session.questionIndex];
    if (!item) throw new Error("No more coding questions are available in this interview.");
    session.currentCodingQuestion = item;
    return formatCodingQuestion(item);
  }

  session.currentCodingQuestion = undefined;

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

For the coding round, create a polished, self-contained coding-practice problem using the exact structure below. Use Markdown headings and fenced code blocks where appropriate:

## Problem
State one clear, original DSA/programming task. Explain exactly what the candidate must implement. Do not include the solution or reveal the answer.

## Input
Describe the input format clearly. If the candidate is expected to implement a function rather than read standard input, state the function signature or expected arguments.

## Output
Describe exactly what the function should return or what should be printed.

## Constraints
Provide realistic, internally consistent constraints that help define the intended solution and complexity. Do not omit constraints that affect correctness.

## Examples
Include one or two examples with explicit input and output in fenced code blocks, for example:
\`\`\`text
Input: ...
Output: ...
\`\`\`
Add a brief explanation for each example, without giving away the algorithm.

INTERNAL QUALITY CHECKS (never include these checks in the candidate-facing response):
- Ask one solvable entry-level placement problem, not unrelated tasks.
- Verify all sample outputs manually and make constraints internally consistent.
- Vary problem patterns across the four questions.
- Do not provide the solution, pseudocode, or leading hints.
- Keep the candidate-facing problem concise and readable.

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
