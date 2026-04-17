import { GoogleGenAI } from "@google/genai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
  return new GoogleGenAI({ apiKey });
}

export const AI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
export const AI_MODEL_QUALITY = process.env.GEMINI_MODEL_QUALITY ?? "gemini-2.0-flash";
export const AI_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 500);
