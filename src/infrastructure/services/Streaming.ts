/**
 * Streaming Text Generation Service
 * Handles streaming text generation using Z.AI API
 */

import type {
  ZaiChatRequest,
  ZaiChatChunk,
  ZaiGenerationConfig,
  ZaiMessage,
} from "../../domain/entities";
import { DEFAULT_MODELS } from "../../domain/entities";
import { zaiHttpClient } from "./ZaiClient";
import { ZaiError, ZaiErrorType } from "../../domain/entities/error.types";

/**
 * Streaming callback interface
 */
export interface StreamingCallbacks {
  /** Called when streaming starts */
  onStart?: () => void;
  /** Called for each chunk of text */
  onChunk?: (chunk: string) => void;
  /** Called when streaming completes */
  onComplete?: (fullText: string) => void;
  /** Called on error */
  onError?: (error: string) => void;
}

/**
 * Generate streaming text from a prompt
 */
class StreamingService {
  /**
   * Build chat request for streaming
   */
  private buildRequest(
    model: string,
    messages: ZaiMessage[],
    config?: ZaiGenerationConfig
  ): ZaiChatRequest {
    return {
      model,
      messages,
      temperature: config?.temperature,
      maxTokens: config?.maxTokens,
      topP: config?.topP,
      n: config?.n,
      stop: config?.stop,
      frequencyPenalty: config?.frequencyPenalty,
      presencePenalty: config?.presencePenalty,
      stream: true,
    };
  }

  /**
   * Generate streaming text
   */
  async generateStreamingText(
    model: string,
    prompt: string,
    callbacks: StreamingCallbacks,
    config?: ZaiGenerationConfig,
    signal?: AbortSignal
  ): Promise<string> {
    if (!prompt || prompt.trim().length < 1) {
      throw new ZaiError(
        ZaiErrorType.INVALID_REQUEST,
        "Prompt must be at least 1 character"
      );
    }

    const messages: ZaiMessage[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.generateStreamingWithMessages(model, messages, callbacks, config, signal);
  }

  /**
   * Generate streaming text with messages
   */
  async generateStreamingWithMessages(
    model: string,
    messages: ZaiMessage[],
    callbacks: StreamingCallbacks,
    config?: ZaiGenerationConfig,
    signal?: AbortSignal
  ): Promise<string> {
    if (!messages || messages.length === 0) {
      throw new ZaiError(
        ZaiErrorType.INVALID_REQUEST,
        "Messages array cannot be empty"
      );
    }

    const request = this.buildRequest(model, messages, config);
    let fullText = "";

    try {
      callbacks.onStart?.();

      for await (const chunk of zaiHttpClient.chatCompletionStream(request, signal)) {
        const delta = chunk.choices?.[0]?.delta;

        if (delta?.content) {
          const content = delta.content;
          fullText += content;
          callbacks.onChunk?.(content);
        }

        // Check if generation is complete
        const finishReason = chunk.choices?.[0]?.finishReason;
        if (finishReason && finishReason !== "stop") {
          // Handle non-normal finish (length, content_filter)
          if (finishReason === "content_filter") {
            throw new ZaiError(
              ZaiErrorType.CONTENT_FILTERED,
              "Content was filtered by Z.AI"
            );
          }
        }
      }

      callbacks.onComplete?.(fullText);
      return fullText;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Simple streaming generation with default model
   */
  async stream(
    prompt: string,
    callbacks: StreamingCallbacks,
    config?: ZaiGenerationConfig,
    signal?: AbortSignal
  ): Promise<string> {
    return this.generateStreamingText(DEFAULT_MODELS.TEXT, prompt, callbacks, config, signal);
  }
}

export const streaming = new StreamingService();
