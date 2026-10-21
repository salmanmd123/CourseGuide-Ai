import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export type SignedQuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  sortOrder: number;
};

export type QuizTokenPayload = {
  quizId: number;
  userId: number;
  questions: SignedQuizQuestion[];
  version: 1;
};

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured.");
  return createHash("sha256").update(secret, "utf8").digest();
}

/** Encrypts the authoritative answer key so it can be kept in IndexedDB
 * without exposing correct answers before submission. AES-GCM authenticates
 * the encrypted payload; only the server has the encryption secret. */
export function encryptQuizPayload(payload: QuizTokenPayload): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64url")).join(".");
}

export function decryptQuizPayload(token: unknown): QuizTokenPayload {
  if (typeof token !== "string" || token.length > 200_000) {
    throw new Error("Invalid quiz token.");
  }

  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid quiz token.");

  const [ivText, tagText, ciphertextText] = parts;
  const iv = Buffer.from(ivText, "base64url");
  const tag = Buffer.from(tagText, "base64url");
  const ciphertext = Buffer.from(ciphertextText, "base64url");

  if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) {
    throw new Error("Invalid quiz token.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
  const payload = JSON.parse(plaintext) as QuizTokenPayload;

  if (
    payload.version !== 1 ||
    !Number.isSafeInteger(payload.quizId) ||
    !Number.isSafeInteger(payload.userId) ||
    !Array.isArray(payload.questions) ||
    payload.questions.length < 1 ||
    payload.questions.length > 20
  ) {
    throw new Error("Invalid quiz payload.");
  }

  return payload;
}
