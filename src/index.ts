/**
 * @umituz/react-native-ai-zai-provider
 * Z.AI (Zhipu AI) text generation provider for React Native applications
 *
 * @author umituz
 * @license MIT
 */

// Domain Types
export type {
  ZaiConfig,
  ZaiGenerationConfig,
  ZaiMessageRole,
  ZaiMessage,
  ZaiChatRequest,
  ZaiChatResponse,
  ZaiChoice,
  ZaiFinishReason,
  ZaiUsage,
  ZaiChatChunk,
  ZaiChunkChoice,
  ZaiErrorResponse,
  ZaiChatConfig,
} from "./domain/entities";

export {
  ZAI_MODELS,
  DEFAULT_MODELS,
} from "./domain/entities";

export {
  ZaiError,
  ZaiErrorType,
  mapHttpStatusToErrorType,
} from "./domain/entities/error.types";

export {
  MODEL_REGISTRY,
  getModelInfo,
  modelSupports,
  type ModelCapabilities,
  type ModelInfo,
} from "./domain/entities/models";

// Services
export { zaiHttpClient } from "./infrastructure/services/ZaiClient";
export { textGeneration } from "./infrastructure/services/TextGeneration";
export { structuredText } from "./infrastructure/services/StructuredText";
export { streaming } from "./infrastructure/services/Streaming";
export {
  chatSessionService,
  createChatSession,
  sendChatMessage,
  buildChatHistory,
  trimChatHistory,
  type ChatSession,
  type SendChatMessageOptions,
  type ChatSendResult,
  type ChatHistoryMessage,
} from "./infrastructure/services";

export type { StreamingCallbacks } from "./infrastructure/services/Streaming";

// React Hooks
export { useZai } from "./presentation/hooks/useZai";
export type { UseZaiOptions, UseZaiReturn } from "./presentation/hooks/useZai";

export { useOperationManager } from "./presentation/hooks/useOperationManager";

// Provider Configuration & Factory
export {
  ConfigBuilder,
  GenerationConfigBuilder,
  providerFactory,
  initializeProvider,
  configureProvider,
  resetProvider,
} from "./providers/ProviderFactory";

export type {
  ProviderConfig,
  ProviderFactoryOptions,
} from "./providers/ProviderFactory";

// Utilities
export {
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  createTextMessage,
  promptToMessages,
  extractTextFromMessages,
  formatMessagesForDisplay,
} from "./infrastructure/utils/content-mapper.util";

export {
  getUserFriendlyError,
  isRetryableError,
  isAuthError,
  formatErrorForLogging,
} from "./infrastructure/utils/error-mapper.util";

export {
  executeWithState,
  executeWithRetry,
  type AsyncStateSetters,
  type AsyncCallbacks,
} from "./infrastructure/utils/async";

export {
  telemetry,
  useTelemetry,
} from "./infrastructure/telemetry";
