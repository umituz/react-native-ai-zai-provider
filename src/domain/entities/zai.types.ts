/**
 * Configuration for Z.AI client initialization
 */
export interface ZaiConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for API requests (default: https://api.z.ai/api/paas/v4/) */
  baseUrl?: string;
  /** Default timeout in milliseconds */
  timeoutMs?: number;
  /** Default model to use for text generation */
  textModel?: string;
}

/**
 * Generation configuration for AI requests
 */
export interface ZaiGenerationConfig {
  /** Controls randomness (0.0 - 2.0, default: 0.7) */
  temperature?: number;
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  /** Nucleus sampling threshold (0.0 - 1.0) */
  topP?: number;
  /** Number of completions to generate */
  n?: number;
  /** Stop sequences */
  stop?: string[];
  /** Frequency penalty (-2.0 to 2.0) */
  frequencyPenalty?: number;
  /** Presence penalty (-2.0 to 2.0) */
  presencePenalty?: number;
}

/**
 * Message role in chat conversation
 */
export type ZaiMessageRole = "system" | "user" | "assistant";

/**
 * Chat message structure
 */
export interface ZaiMessage {
  /** Role of the message sender */
  role: ZaiMessageRole;
  /** Content of the message */
  content: string;
}

/**
 * Chat completion request
 */
export interface ZaiChatRequest {
  /** Model to use for generation */
  model: string;
  /** Array of messages in the conversation */
  messages: ZaiMessage[];
  /** Generation configuration */
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  n?: number;
  stop?: string[];
  frequencyPenalty?: number;
  presencePenalty?: number;
  /** Enable streaming response */
  stream?: boolean;
}

/**
 * Chat completion response
 */
export interface ZaiChatResponse {
  /** Unique identifier for the response */
  id: string;
  /** Object type (chat.completion) */
  object: string;
  /** Timestamp of creation */
  created: number;
  /** Model used for generation */
  model: string;
  /** Array of completion choices */
  choices: ZaiChoice[];
  /** Token usage information */
  usage: ZaiUsage;
}

/**
 * Individual completion choice
 */
export interface ZaiChoice {
  /** Index of the choice */
  index: number;
  /** Generated message */
  message: {
    role: "assistant";
    content: string;
  };
  /** Reason for finish (stop, length, etc.) */
  finishReason: ZaiFinishReason;
}

/**
 * Finish reason types
 */
export type ZaiFinishReason = "stop" | "length" | "content_filter";

/**
 * Token usage information
 */
export interface ZaiUsage {
  /** Number of tokens in the prompt */
  promptTokens: number;
  /** Number of tokens in the completion */
  completionTokens: number;
  /** Total number of tokens used */
  totalTokens: number;
}

/**
 * Streaming chunk response
 */
export interface ZaiChatChunk {
  /** Unique identifier for the response */
  id: string;
  /** Object type (chat.completion.chunk) */
  object: string;
  /** Timestamp of creation */
  created: number;
  /** Model used for generation */
  model: string;
  /** Array of completion choices */
  choices: ZaiChunkChoice[];
}

/**
 * Individual chunk choice for streaming
 */
export interface ZaiChunkChoice {
  /** Index of the choice */
  index: number;
  /** Delta message (partial content) */
  delta: {
    role?: "assistant";
    content?: string;
  };
  /** Reason for finish (null if not finished) */
  finishReason: ZaiFinishReason | null;
}

/**
 * API error response
 */
export interface ZaiErrorResponse {
  /** Error type */
  error: {
    /** Error message */
    message: string;
    /** Error type */
    type: string;
    /** Error code */
    code?: string;
  };
}

/**
 * Configuration for a chat session
 */
export interface ZaiChatConfig {
  /** Model name override */
  model?: string;
  /** System instruction for the model */
  systemInstruction?: string;
  /** Generation config (temperature, maxTokens, etc.) */
  generationConfig?: ZaiGenerationConfig;
  /** Initial conversation history */
  history?: ZaiMessage[];
}

/**
 * Available Z.AI models
 */
export const ZAI_MODELS = {
  /** Latest model */
  GLM_4_7: "glm-4.7",
  /** Stable model */
  GLM_4_6: "glm-4.6",
  /** Previous version */
  GLM_4_5: "glm-4.5",
  /** Vision model */
  GLM_4_6V: "glm-4.6v",
  /** 32B context model */
  GLM_4_32B: "glm-4-32b-0414-128k",
} as const;

/**
 * Default models for different use cases
 */
export const DEFAULT_MODELS = {
  TEXT: ZAI_MODELS.GLM_4_7,
  VISION: ZAI_MODELS.GLM_4_6V,
  FAST: ZAI_MODELS.GLM_4_5,
} as const;
