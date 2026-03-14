/**
 * Z.AI Error Types
 */

/**
 * Error categories for Z.AI operations
 */
export enum ZaiErrorType {
  // Configuration Errors
  INVALID_API_KEY = "INVALID_API_KEY",
  MISSING_CONFIG = "MISSING_CONFIG",
  INVALID_MODEL = "INVALID_MODEL",

  // Request Errors
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  ABORT_ERROR = "ABORT_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",

  // API Errors
  API_ERROR = "API_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  CONTENT_FILTERED = "CONTENT_FILTERED",
  INVALID_REQUEST = "INVALID_REQUEST",

  // Response Errors
  EMPTY_RESPONSE = "EMPTY_RESPONSE",
  MALFORMED_RESPONSE = "MALFORMED_RESPONSE",
  PARSING_ERROR = "PARSING_ERROR",

  // Unknown
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Error codes from Z.AI API
 */
export enum ZaiApiErrorCode {
  INVALID_API_KEY = "invalid_api_key",
  INSUFFICIENT_QUOTA = "insufficient_quota",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  INVALID_REQUEST = "invalid_request",
  CONTENT_FILTERED = "content_filtered",
}

/**
 * Custom error class for Z.AI operations
 */
export class ZaiError extends Error {
  constructor(
    public type: ZaiErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ZaiError";
  }
}

/**
 * Maps HTTP status codes to ZaiErrorType
 */
export function mapHttpStatusToErrorType(status: number): ZaiErrorType {
  switch (status) {
    case 401:
      return ZaiErrorType.AUTHENTICATION_ERROR;
    case 429:
      return ZaiErrorType.RATE_LIMIT_ERROR;
    case 400:
      return ZaiErrorType.INVALID_REQUEST;
    case 402:
      return ZaiErrorType.QUOTA_EXCEEDED;
    case 500:
    case 502:
    case 503:
      return ZaiErrorType.API_ERROR;
    default:
      return ZaiErrorType.UNKNOWN_ERROR;
  }
}
