/**
 * Error Mapper Utilities
 * Helper functions for mapping and formatting errors
 */

import { ZaiError, ZaiErrorType } from "../../domain/entities/error.types";

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES: Record<ZaiErrorType, string> = {
  [ZaiErrorType.INVALID_API_KEY]: "Invalid API key. Please check your Z.AI API key.",
  [ZaiErrorType.MISSING_CONFIG]: "Z.AI client not configured. Please provide an API key.",
  [ZaiErrorType.INVALID_MODEL]: "Invalid model selected. Please check the model name.",
  [ZaiErrorType.NETWORK_ERROR]: "Network error. Please check your internet connection.",
  [ZaiErrorType.TIMEOUT_ERROR]: "Request timed out. Please try again.",
  [ZaiErrorType.ABORT_ERROR]: "Request was cancelled.",
  [ZaiErrorType.RATE_LIMIT_ERROR]: "Too many requests. Please wait a moment and try again.",
  [ZaiErrorType.API_ERROR]: "Z.AI API error. Please try again later.",
  [ZaiErrorType.AUTHENTICATION_ERROR]: "Authentication failed. Please check your API key.",
  [ZaiErrorType.QUOTA_EXCEEDED]: "API quota exceeded. Please check your Z.AI account.",
  [ZaiErrorType.CONTENT_FILTERED]: "Content was filtered by Z.AI safety filters.",
  [ZaiErrorType.INVALID_REQUEST]: "Invalid request. Please check your input.",
  [ZaiErrorType.EMPTY_RESPONSE]: "Empty response received from Z.AI.",
  [ZaiErrorType.MALFORMED_RESPONSE]: "Malformed response from Z.AI.",
  [ZaiErrorType.PARSING_ERROR]: "Failed to parse response from Z.AI.",
  [ZaiErrorType.UNKNOWN_ERROR]: "An unknown error occurred. Please try again.",
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof ZaiError) {
    return ERROR_MESSAGES[error.type] || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return ERROR_MESSAGES[ZaiErrorType.UNKNOWN_ERROR];
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ZaiError) {
    return [
      ZaiErrorType.NETWORK_ERROR,
      ZaiErrorType.TIMEOUT_ERROR,
      ZaiErrorType.RATE_LIMIT_ERROR,
      ZaiErrorType.API_ERROR,
    ].includes(error.type);
  }

  return false;
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ZaiError) {
    return [
      ZaiErrorType.INVALID_API_KEY,
      ZaiErrorType.AUTHENTICATION_ERROR,
    ].includes(error.type);
  }

  return false;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): string {
  if (error instanceof ZaiError) {
    return `ZaiError [${error.type}]: ${error.message}`;
  }

  if (error instanceof Error) {
    return `Error: ${error.name} - ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
}
