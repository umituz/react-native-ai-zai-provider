/**
 * Async State Management Utilities
 * Helper functions for managing async operation state
 */

import { ZaiError } from "../../../domain/entities/error.types";

/**
 * State setters for async operations
 */
export interface AsyncStateSetters<TResult = unknown, TSecondary = unknown> {
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResult: (result: TResult) => void;
  setSecondaryResult?: (result: TSecondary) => void;
}

/**
 * Callbacks for async operation results
 */
export interface AsyncCallbacks<TResult = unknown> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: string) => void;
}

/**
 * Execute an async operation with state management
 */
export async function executeWithState<TResult>(
  setters: AsyncStateSetters<TResult>,
  callbacks: AsyncCallbacks<TResult>,
  operation: () => Promise<TResult>,
  onSuccess?: (result: TResult) => void
): Promise<TResult> {
  const { setIsLoading, setError, setResult, setSecondaryResult } = setters;

  try {
    setIsLoading(true);
    setError(null);

    const result = await operation();

    setResult(result);
    onSuccess?.(result);
    callbacks.onSuccess?.(result);

    return result;
  } catch (error) {
    let errorMessage = "An unknown error occurred";

    if (error instanceof ZaiError) {
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    setError(errorMessage);
    callbacks.onError?.(errorMessage);

    throw error;
  } finally {
    setIsLoading(false);
  }
}

/**
 * Execute an async operation with retry logic
 */
export async function executeWithRetry<TResult>(
  operation: () => Promise<TResult>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<TResult> {
  let lastError: Error | ZaiError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error || error instanceof ZaiError ? error : new Error(String(error));

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
