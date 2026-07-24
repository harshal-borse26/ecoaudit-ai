import { GoogleGenAI } from "@google/genai";

let aiClient = null;

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

/**
 * Extracts utility bill data from binary buffer using Google Gemini API.
 */
export const extractBillFromBuffer = async ({ fileBuffer, mimeType, prompt }) => {
  const ai = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  console.log(`[Gemini Provider] Invoking model: ${modelName}`);

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType,
          data: fileBuffer.toString("base64"),
        },
      },
    ],
  });

  // Safely extract text from candidates to avoid SDK throwing on empty/blocked responses
  const candidates = response?.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error(
      `Gemini returned no candidates. Possible safety filter or quota issue. FinishReason: ${response?.promptFeedback?.blockReason || "unknown"}`
    );
  }

  const firstCandidate = candidates[0];
  const finishReason = firstCandidate?.finishReason;

  // SAFETY / RECITATION blocks — treat as a failover trigger
  if (finishReason && finishReason !== "STOP" && finishReason !== "MAX_TOKENS") {
    throw new Error(
      `Gemini response blocked. FinishReason: ${finishReason}. Triggering failover.`
    );
  }

  const responseText =
    firstCandidate?.content?.parts?.map((p) => p.text || "").join("") || "";

  console.log("[Gemini Provider] Raw response received.");

  if (!responseText.trim()) {
    throw new Error("Gemini returned an empty response text. Triggering failover.");
  }

  // Strip markdown code fences (```json ... ```)
  const cleanedJsonString = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsedData = JSON.parse(cleanedJsonString);
  return parsedData;
};
