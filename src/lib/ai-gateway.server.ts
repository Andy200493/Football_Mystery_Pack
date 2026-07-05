import { createGoogleGenerativeAI } from "@ai-sdk/google";

export function getGateway() {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!key) {
    throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
  }

  return createGoogleGenerativeAI({
    apiKey: key,
  });
}