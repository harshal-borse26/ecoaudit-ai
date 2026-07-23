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
    console.log("Bill URL:", billFileUrl);

    const mimeType = getMimeType(billFileUrl);
    console.log("Mime Type:", mimeType);

    const prompt = `
You are an expert enterprise utility bill parser and AI document intelligence system.

Extract all details from the utility bill document and return ONLY a valid JSON object.

Rules:
- Do not include markdown formatting or explanations. Return valid JSON only.
- Return null if a top-level field is not found in the bill.
- "billType": Primary type of bill (e.g. "Electricity", "Water", "Natural Gas", "Diesel", "Dual Utility").
- "utilities": Array of utility services extracted: [ { "type": "Electricity/Water/Gas", "usage": numeric_value, "unit": "kWh/KL/L/Gallons/Therms", "amount": numeric_value } ].
- "aiExtractedData": Object containing ALL additional metadata key-value pairs present on the bill (e.g. billingDays, sanctionLoad, currentReading, previousReading, energyCharge, fixedCharge, customerCategory, taxAmount, supplyType, tariffCategory, invoiceNumber, accountNumber, connectedLoad, penaltyAmount, discountAmount, dueDays, etc.).
- ONLY include keys inside "aiExtractedData" that ACTUALLY exist in the document with non-null meaningful values. Do not invent or include null/N/A values.

Return this JSON format:
{
  "consumerName": null,
  "meterNumber": null,
  "billDate": null,
  "billMonth": null,
  "billYear": null,
  "billType": null,
  "totalAmount": null,
  "utilities": [
    {
      "type": "Electricity",
      "usage": 0,
      "unit": "kWh",
      "amount": 0
    }
  ],
  "aiExtractedData": {
    "billingDays": 30,
    "customerCategory": "Commercial"
  }
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

    console.error(error);

    throw error;

}
};