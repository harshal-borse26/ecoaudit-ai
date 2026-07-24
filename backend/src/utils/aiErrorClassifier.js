/**
 * Utility to classify AI Provider errors into retryable/failover errors vs permanent errors.
 */

export const ErrorTypes = {
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  RATE_LIMIT: "RATE_LIMIT",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  MODEL_UNAVAILABLE: "MODEL_UNAVAILABLE",
  NETWORK_ERROR: "NETWORK_ERROR",
  INVALID_JSON: "INVALID_JSON",
  AUTH_ERROR: "AUTH_ERROR",
  PERMANENT_ERROR: "PERMANENT_ERROR",
};

/**
 * Classifies an error and returns an object indicating error category and whether failover to next provider should occur.
 */
export const classifyAiError = (error) => {
  const message = (error?.message || "").toLowerCase();
  const status = error?.status || error?.response?.status;
  const statusText = (error?.response?.statusText || "").toLowerCase();

  // 1. Quota & Rate Limit Errors (HTTP 429, RESOURCE_EXHAUSTED, quota limit)
  if (
    status === 429 ||
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit")
  ) {
    return {
      type: ErrorTypes.QUOTA_EXCEEDED,
      isFailoverTrigger: true,
      reason: "API quota or rate limit exceeded.",
    };
  }

  // 1b. Empty model output / safety block (Gemini SDK throws this when response has no candidates)
  if (
    message.includes("model output must contain") ||
    message.includes("no candidates") ||
    message.includes("response blocked") ||
    message.includes("finishreason") ||
    message.includes("empty response text") ||
    message.includes("safety") ||
    message.includes("recitation")
  ) {
    return {
      type: ErrorTypes.SERVICE_UNAVAILABLE,
      isFailoverTrigger: true,
      reason: "Gemini returned an empty or safety-blocked response.",
    };
  }

  // 2. Model Unavailable / Not Found / Deprecated (HTTP 404 or specific error string)
  if (
    status === 404 ||
    message.includes("not found") ||
    message.includes("no longer available") ||
    message.includes("deprecated")
  ) {
    return {
      type: ErrorTypes.MODEL_UNAVAILABLE,
      isFailoverTrigger: true,
      reason: "Requested AI model is unavailable or non-existent.",
    };
  }

  // 3. Service Unavailability / Overloaded (HTTP 500, 502, 503, 504)
  if (
    [500, 502, 503, 504].includes(status) ||
    message.includes("overloaded") ||
    message.includes("unavailable") ||
    statusText.includes("service unavailable")
  ) {
    return {
      type: ErrorTypes.SERVICE_UNAVAILABLE,
      isFailoverTrigger: true,
      reason: "AI provider service unavailable or overloaded.",
    };
  }

  // 4. Network / Connection Errors
  if (
    error.code === "ECONNRESET" ||
    error.code === "ETIMEDOUT" ||
    error.code === "ENOTFOUND" ||
    message.includes("network error") ||
    message.includes("timeout")
  ) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      isFailoverTrigger: true,
      reason: "Network connection to AI provider failed.",
    };
  }

  // 5. Invalid Response Parsing (JSON parse error from provider output)
  if (error instanceof SyntaxError || message.includes("json")) {
    return {
      type: ErrorTypes.INVALID_JSON,
      isFailoverTrigger: true,
      reason: "AI provider returned invalid JSON response.",
    };
  }

  // 6. Authentication / API Key Error (401 / 403)
  if (status === 401 || status === 403 || message.includes("api key") || message.includes("unauthorized")) {
    return {
      type: ErrorTypes.AUTH_ERROR,
      isFailoverTrigger: true,
      reason: "Authentication failed or API key invalid.",
    };
  }

  // Default: treat execution error as failover trigger if providers remain
  return {
    type: ErrorTypes.PERMANENT_ERROR,
    isFailoverTrigger: true,
    reason: error.message || "Unknown AI provider error.",
  };
};
