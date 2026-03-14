/**
 * Structured Text Generation Service
 * Generates JSON/structured output using Z.AI API
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

/**
 * Generate structured text (JSON) from a prompt
 */
class StructuredTextService {
  /**
   * Build chat request for structured output
   */
  private buildRequest(
    model: string,
    messages: ZaiMessage[],
    config?: ZaiGenerationConfig
  ): ZaiChatRequest {
    return {
      model,
      messages,
      temperature: config?.temperature ?? 0.3, // Lower temp for structured output
      maxTokens: config?.maxTokens,
      topP: config?.topP,
      n: config?.n ?? 1,
      stop: config?.stop,
      frequencyPenalty: config?.frequencyPenalty,
      presencePenalty: config?.presencePenalty,
      stream: false,
    };
  }

  /**
   * Extract JSON from response
   */
  private extractJSON<T>(response: ZaiChatResponse): T {
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

    const content = choice.message.content.trim();

    // Try to parse JSON
    try {
      return JSON.parse(content) as T;
    } catch (error) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]) as T;
        } catch {
          // If still fails, throw error
        }
      }

      throw new ZaiError(
        ZaiErrorType.PARSING_ERROR,
        "Failed to parse JSON from response",
        error
      );
    }
  }

  /**
   * Generate structured text with schema
   */
  async generateStructuredText<T>(
    model: string,
    prompt: string,
    schema: Record<string, unknown>,
    config?: ZaiGenerationConfig,
    signal?: AbortSignal
  ): Promise<T> {
    if (!prompt || prompt.trim().length < 1) {
      throw new ZaiError(
        ZaiErrorType.INVALID_REQUEST,
        "Prompt must be at least 1 character"
      );
    }

    // Build prompt with schema
    const systemPrompt = `You are a helpful assistant that responds with valid JSON.
Your response must match this schema:
${JSON.stringify(schema, null, 2)}

Respond ONLY with valid JSON, no additional text or explanation.`;

    const messages: ZaiMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const request = this.buildRequest(model, messages, config);
    const response = await zaiHttpClient.chatCompletion(request, signal);

    return this.extractJSON<T>(response);
  }

  /**
   * Generate JSON with default model
   */
  async generateJSON<T>(
    prompt: string,
    schema: Record<string, unknown>,
    config?: ZaiGenerationConfig,
    signal?: AbortSignal
  ): Promise<T> {
    return this.generateStructuredText<T>(
      DEFAULT_MODELS.TEXT,
      prompt,
      schema,
      config,
      signal
    );
  }

  /**
   * Generate JSON with system instruction
   */
  async generateJSONWithSystem<T>(
    model: string,
    systemInstruction: string,
    prompt: string,
    schema: Record<string, unknown>,
    config?: ZaiGenerationConfig,
    signal?: AbortSignal
  ): Promise<T> {
    if (!prompt || prompt.trim().length < 1) {
      throw new ZaiError(
        ZaiErrorType.INVALID_REQUEST,
        "Prompt must be at least 1 character"
      );
    }

    const fullSystemPrompt = `${systemInstruction}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}\n\nRespond ONLY with valid JSON, no additional text.`;

    const messages: ZaiMessage[] = [
      {
        role: "system",
        content: fullSystemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const request = this.buildRequest(model, messages, config);
    const response = await zaiHttpClient.chatCompletion(request, signal);

    return this.extractJSON<T>(response);
  }
}

export const structuredText = new StructuredTextService();
