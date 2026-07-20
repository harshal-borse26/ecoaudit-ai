import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import mime from "mime-types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Download bill from S3/public URL
const downloadBill = async (billFileUrl) => {
  const response = await axios.get(billFileUrl, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
};

// Detect MIME type
const getMimeType = (billFileUrl) => {
  return mime.lookup(billFileUrl) || "application/pdf";
};

// Main AI function
export const extractBillData = async (billFileUrl) => {
  try {
    const fileBuffer = await downloadBill(billFileUrl);
    console.log("Buffer Size:", fileBuffer.length);

    const mimeType = getMimeType(billFileUrl);
    console.log("Mime Type:", mimeType);

    const prompt = `
You are an expert utility bill parser.

Extract the bill details and return ONLY valid JSON.

Rules:
- Do not include markdown.
- Do not include explanation.
- Return null if a value is missing.
- If the bill contains multiple utility services, return all of them in the "utilities" array.
- For usage, return only the numeric value.
- Keep the measurement unit separately.

Return this JSON format:

{
  "consumerName": "",
  "meterNumber": "",
  "billDate": "",
  "billMonth": "",
  "billYear": 0,
  "totalAmount": 0,
  "utilities": [
    {
      "type": "",
      "usage": 0,
      "unit": "",
      "amount": 0
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
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

    const text = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to process bill with AI");
  }
};