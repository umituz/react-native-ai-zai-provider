/**
 * Text Generation Service
 * Handles text-to-text generation using Z.AI API
 */

import type {
  ZaiChatRequest,
  ZaiChatResponse,
  ZaiGenerationConfig,
  ZaiMessage,
} from "../../domain/entities";
import { DEFAULT_MODELS } from "../../domain/entities";
import { zaiHttpClient } from "./ZaiClient";
import { ZaiError, ZaiErrorType } from "../../domain/entities/error.types";

class TextGenerationService {
  /**
   * Build chat request from parameters
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
      stream: false,
    };
  }

  /**
   * Extract text from response
   */
  private extractText(response: ZaiChatResponse): string {
    if (!response.choices || response.choices.length === 0) {
      throw new ZaiError(
        ZaiErrorType.EMPTY_RESPONSE,
        "No choices returned from API"
      );
    }

    const choice = response.choices[0];
    if (!choice.message?.content) {
      throw new ZaiError(
        ZaiErrorType.EMPTY_RESPONSE,
        "Empty content in response"
      );
    }

    return choice.message.content;
  }

  /**
   * Generate text from a prompt
   */
  async generateText(
    model: string,
    prompt: string,
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

    const request = this.buildRequest(model, messages, config);
    const response = await zaiHttpClient.chatCompletion(request, signal);

    return this.extractText(response);
  }

  /**
   * Generate text with system instruction
   */
  async generateTextWithSystem(
    model: string,
    systemInstruction: string,
    prompt: string,
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
        role: "system",
        content: systemInstruction,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const request = this.buildRequest(model, messages, config);
    const response = await zaiHttpClient.chatCompletion(request, signal);

    return this.extractText(response);
  }

  /**
   * Generate text with chat history
   */
  async generateTextWithHistory(
    model: string,
    messages: ZaiMessage[],
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
    const response = await zaiHttpClient.chatCompletion(request, signal);

    return this.extractText(response);
  }

  /**
   * Simple text generation with default model
   */
  async generate(
    prompt: string,
    config?: ZaiGenerationConfig,
    signal?: AbortSignal
  ): Promise<string> {
    return this.generateText(DEFAULT_MODELS.TEXT, prompt, config, signal);
  }

  /**
   * Quick generation helper
   */
  async quick(
    prompt: string,
    model?: string,
    signal?: AbortSignal
  ): Promise<string> {
    return this.generateText(model || DEFAULT_MODELS.TEXT, prompt, undefined, signal);
  }
}

export const textGeneration = new TextGenerationService();
