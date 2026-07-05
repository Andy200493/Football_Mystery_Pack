import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function getGateway() {
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  return createOpenAICompatible({
    name: "openrouter",
    apiKey: key,
    baseURL: "https://openrouter.ai/api/v1",
  });
}