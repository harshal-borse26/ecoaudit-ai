import axios from "axios";
import mime from "mime-types";
import { generatePresignedUrl, getS3KeyFromUrl } from "./s3Service.js";
import * as geminiProvider from "../providers/geminiProvider.js";
import * as openRouterProvider from "../providers/openRouterProvider.js";
import { classifyAiError } from "../utils/aiErrorClassifier.js";

// Provider registry mapping
const providers = {
  gemini: geminiProvider,
  openrouter: openRouterProvider,
};

// Download bill from S3 private bucket via presigned URL
const downloadBill = async (billFileKeyOrUrl) => {
  if (!billFileKeyOrUrl) {
    throw new Error("No bill file key or URL provided for AI extraction.");
  }

  const key = getS3KeyFromUrl(billFileKeyOrUrl);
  const signedUrl = await generatePresignedUrl(key, { mode: "preview", expiresIn: 900 });

  console.log(`[AI Service] Generated S3 presigned URL for key: ${key}`);

  const response = await axios.get(signedUrl, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
};

// Detect MIME type
const getMimeType = (billFileKeyOrUrl) => {
  return mime.lookup(billFileKeyOrUrl) || "application/pdf";
};

// Normalizes and validates AI extracted JSON structure
const validateAndNormalizeExtractedData = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Extracted data is not a valid JSON object.");
  }

  // Ensure aiExtractedData exists and is clean of junk null/undefined
  let aiExtractedData = data.aiExtractedData || {};
  if (typeof aiExtractedData !== "object" || aiExtractedData === null) {
    aiExtractedData = {};
  }

  // Filter out null/undefined/junk from aiExtractedData
  const cleanAiExtractedData = {};
  Object.entries(aiExtractedData).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v).trim().toLowerCase() !== "null" && String(v).trim().toLowerCase() !== "n/a") {
      cleanAiExtractedData[k] = v;
    }
  });

  return {
    consumerName: data.consumerName || null,
    meterNumber: data.meterNumber || null,
    billDate: data.billDate || null,
    billMonth: data.billMonth || null,
    billYear: data.billYear || null,
    billType: data.billType || null,
    totalAmount: data.totalAmount != null ? Number(data.totalAmount) : null,
    utilities: Array.isArray(data.utilities) ? data.utilities : [],
    aiExtractedData: cleanAiExtractedData,
  };
};

/**
 * Main AI Bill Data Extraction service with Provider Failover Architecture.
 */
export const extractBillData = async (billFileKeyOrUrl) => {
  const fileBuffer = await downloadBill(billFileKeyOrUrl);
  const mimeType = getMimeType(billFileKeyOrUrl);

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

  // Determine provider execution order
  const primaryProviderName = (process.env.AI_PRIMARY_PROVIDER || "gemini").toLowerCase();
  const fallbackProviderName = (process.env.AI_FALLBACK_PROVIDER || "openrouter").toLowerCase();

  const providerChain = [primaryProviderName, fallbackProviderName].filter(
    (name, index, self) => providers[name] && self.indexOf(name) === index
  );

  let lastError = null;

  for (let i = 0; i < providerChain.length; i++) {
    const providerName = providerChain[i];
    const providerModule = providers[providerName];

    console.log(`[AI Failover Manager] Attempting provider (${i + 1}/${providerChain.length}): ${providerName.toUpperCase()}`);

    try {
      const rawExtracted = await providerModule.extractBillFromBuffer({
        fileBuffer,
        mimeType,
        prompt,
      });

      const normalized = validateAndNormalizeExtractedData(rawExtracted);
      console.log(`[AI Failover Manager] Provider ${providerName.toUpperCase()} succeeded! Data extracted successfully.`);
      return normalized;
    } catch (err) {
      lastError = err;
      const classification = classifyAiError(err);
      console.error(
        `[AI Failover Manager] Provider ${providerName.toUpperCase()} failed. Reason: ${classification.reason}`
      );

      if (i < providerChain.length - 1) {
        console.warn(`[AI Failover Manager] Triggering failover to next provider...`);
      }
    }
  }

  throw new Error(`All AI Providers failed extraction. Last error: ${lastError?.message || "Unknown failure"}`);
};