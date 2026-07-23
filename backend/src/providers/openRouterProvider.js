import axios from "axios";

/**
 * Extracts utility bill data from binary buffer using OpenRouter API.
 * Uses OpenAI-compatible Vision API.
 */
export const extractBillFromBuffer = async ({
  fileBuffer,
  mimeType,
  prompt,
}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not configured."
    );
  }

  const modelName =
    process.env.OPENROUTER_MODEL || "openrouter/free";

  const base64Data = fileBuffer.toString("base64");

  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  console.log(
    `[OpenRouter Provider] Invoking model: ${modelName}`
  );

  const payload = {
    model: modelName,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
            },
          },
        ],
      },
    ],
  };

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ecoaudit.ai",
          "X-Title": "EcoAudit AI Document Intelligence",
        },
        timeout: 60000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "OpenRouter API returned empty response content."
      );
    }

    console.log("[OpenRouter Provider] Raw response received.");

    const cleanedJsonString = content
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedJsonString);
  } catch (err) {
    console.log("========== OPENROUTER ERROR ==========");
    console.log(err.response?.data || err.message);
    console.log("======================================");

    throw err;
  }
};