/**
 * Z.AI HTTP Client
 * Handles all HTTP communication with Z.AI API
 */

import type {
  ZaiConfig,
  ZaiChatRequest,
  ZaiChatResponse,
  ZaiChatChunk,
} from "../../domain/entities";
import { ZaiError, ZaiErrorType, mapHttpStatusToErrorType } from "../../domain/entities/error.types";

const DEFAULT_BASE_URL = "https://api.z.ai/api/paas/v4";
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const CHAT_COMPLETIONS_ENDPOINT = "/chat/completions";

class ZaiHttpClient {
  private config: ZaiConfig | null = null;
  private initialized = false;

  /**
   * Initialize the client with configuration
   */
  initialize(config: ZaiConfig): void {
    const apiKey = config.apiKey?.trim();

    if (!apiKey || apiKey.length < 10) {
      throw new ZaiError(
        ZaiErrorType.INVALID_API_KEY,
        "API key is required and must be at least 10 characters"
      );
    }

    this.config = {
      apiKey,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
      timeoutMs: config.timeoutMs || DEFAULT_TIMEOUT,
      textModel: config.textModel,
    };
    this.initialized = true;
  }

  /**
   * Check if client is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.config !== null;
  }

  /**
   * Get current configuration
   */
  getConfig(): ZaiConfig {
    if (!this.config || !this.initialized) {
      throw new ZaiError(
        ZaiErrorType.MISSING_CONFIG,
        "Client not initialized. Call initialize() first."
      );
    }
    return this.config;
  }

  /**
   * Make an HTTP request to Z.AI API
   */
  private async request<T>(
    endpoint: string,
    body: unknown,
    signal?: AbortSignal
  ): Promise<T> {
    if (!this.config || !this.initialized) {
      throw new ZaiError(
        ZaiErrorType.MISSING_CONFIG,
        "Client not initialized. Call initialize() first."
      );
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const timeout = this.config.timeoutMs || DEFAULT_TIMEOUT;

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Use provided signal if available
      if (signal) {
        signal.addEventListener("abort", () => controller.abort());
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "Accept-Language": "en-US,en",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      throw this.handleRequestError(error);
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}`;
    let errorType = mapHttpStatusToErrorType(response.status);

    try {
      const errorData = (await response.json()) as { error?: { message?: string } };
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // If parsing fails, use default message
    }

    throw new ZaiError(errorType, errorMessage, {
      status: response.status,
      url: response.url,
    });
  }

  /**
   * Handle request errors (network, timeout, abort)
   */
  private handleRequestError(error: unknown): ZaiError {
    if (error instanceof ZaiError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return new ZaiError(
          ZaiErrorType.ABORT_ERROR,
          "Request was aborted by the client",
          error
        );
      }

      if (error.name === "TypeError" && error.message.includes("network")) {
        return new ZaiError(
          ZaiErrorType.NETWORK_ERROR,
          "Network error: Unable to connect to Z.AI API",
          error
        );
      }
    }

    return new ZaiError(
      ZaiErrorType.UNKNOWN_ERROR,
      error instanceof Error ? error.message : "Unknown error occurred",
      error
    );
  }

  /**
   * Send chat completion request (non-streaming)
   */
  async chatCompletion(
    request: ZaiChatRequest,
    signal?: AbortSignal
  ): Promise<ZaiChatResponse> {
    return this.request<ZaiChatResponse>(
      CHAT_COMPLETIONS_ENDPOINT,
      { ...request, stream: false },
      signal
    );
  }

  /**
   * Send chat completion request (streaming)
   * Returns an async generator of chunks
   */
  async *chatCompletionStream(
    request: ZaiChatRequest,
    signal?: AbortSignal
  ): AsyncGenerator<ZaiChatChunk> {
    if (!this.config || !this.initialized) {
      throw new ZaiError(
        ZaiErrorType.MISSING_CONFIG,
        "Client not initialized. Call initialize() first."
      );
    }

    const url = `${this.config.baseUrl}${CHAT_COMPLETIONS_ENDPOINT}`;
    const timeout = this.config.timeoutMs || DEFAULT_TIMEOUT;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Use provided signal if available
    if (signal) {
      signal.addEventListener("abort", () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "Accept-Language": "en-US,en",
        },
        body: JSON.stringify({ ...request, stream: true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (!response.body) {
        throw new ZaiError(
          ZaiErrorType.NETWORK_ERROR,
          "Response body is null"
        );
      }

      // Read and parse Server-Sent Events
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            try {
              const chunk = JSON.parse(jsonStr) as ZaiChatChunk;
              yield chunk;
            } catch (error) {
              console.error("Failed to parse SSE chunk:", error);
            }
          }
        }
      }
    } catch (error) {
      throw this.handleRequestError(error);
    }
  }

  /**
   * Reset the client
   */
  reset(): void {
    this.config = null;
    this.initialized = false;
  }
}

/**
 * Singleton instance
 */
export const zaiHttpClient = new ZaiHttpClient();
