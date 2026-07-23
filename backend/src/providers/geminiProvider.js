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

  const responseText = response.text || "";
  console.log("[Gemini Provider] Raw response received.");

  // Strip markdown code fences (```json ... ```)
  const cleanedJsonString = responseText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsedData = JSON.parse(cleanedJsonString);
  return parsedData;
};
