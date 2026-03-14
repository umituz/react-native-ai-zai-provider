/**
 * Chat Session Service
 * Manages multi-turn conversations with Z.AI
 */

import type {
  ZaiMessage,
  ZaiGenerationConfig,
  ZaiChatConfig,
} from "../../domain/entities";
import { DEFAULT_MODELS } from "../../domain/entities";
import { textGeneration } from "./TextGeneration";

/**
 * Chat session state
 */
export interface ChatSession {
  /** Session ID */
  id: string;
  /** Model being used */
  model: string;
  /** System instruction */
  systemInstruction?: string;
  /** Conversation history */
  history: ZaiMessage[];
  /** Generation config */
  generationConfig?: ZaiGenerationConfig;
}

/**
 * Options for sending a chat message
 */
export interface SendChatMessageOptions {
  /** Whether to include this message in history */
  saveToHistory?: boolean;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

/**
 * Result of sending a chat message
 */
export interface ChatSendResult {
  /** Generated response */
  response: string;
  /** Updated conversation history */
  history: ZaiMessage[];
  /** Token usage information */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Type for chat history messages
 */
export type ChatHistoryMessage = ZaiMessage;

class ChatSessionService {
  private sessions: Map<string, ChatSession> = new Map();
  private sessionIdCounter = 0;

  /**
   * Create a new chat session
   */
  createChatSession(config?: ZaiChatConfig): ChatSession {
    const sessionId = `session_${++this.sessionIdCounter}`;
    const session: ChatSession = {
      id: sessionId,
      model: config?.model || DEFAULT_MODELS.TEXT,
      systemInstruction: config?.systemInstruction,
      history: config?.history || [],
      generationConfig: config?.generationConfig,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Send a message in a chat session
   */
  async sendChatMessage(
    sessionId: string,
    userMessage: string,
    options?: SendChatMessageOptions
  ): Promise<ChatSendResult> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error("User message cannot be empty");
    }

    // Build messages array
    const messages: ZaiMessage[] = [];

    // Add system instruction if present
    if (session.systemInstruction) {
      messages.push({
        role: "system",
        content: session.systemInstruction,
      });
    }

    // Add history
    messages.push(...session.history);

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage,
    });

    // Generate response
    const response = await textGeneration.generateTextWithHistory(
      session.model,
      messages,
      session.generationConfig,
      options?.signal
    );

    // Update history if needed
    if (options?.saveToHistory !== false) {
      session.history.push(
        { role: "user", content: userMessage },
        { role: "assistant", content: response }
      );
    }

    return {
      response,
      history: session.history,
    };
  }

  /**
   * Clear session history
   */
  clearHistory(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history = [];
    }
  }

  /**
   * Build chat history from message pairs
   */
  buildChatHistory(messages: Array<{ user: string; assistant: string }>): ZaiMessage[] {
    const history: ZaiMessage[] = [];

    for (const pair of messages) {
      history.push(
        { role: "user", content: pair.user },
        { role: "assistant", content: pair.assistant }
      );
    }

    return history;
  }

  /**
   * Trim chat history to max messages
   */
  trimChatHistory(history: ZaiMessage[], maxMessages: number = 50): ZaiMessage[] {
    if (history.length <= maxMessages) {
      return history;
    }

    // Keep system messages and trim user/assistant messages
    const systemMessages = history.filter((m) => m.role === "system");
    const conversationMessages = history.filter((m) => m.role !== "system");

    const trimmedConversation = conversationMessages.slice(-maxMessages);

    return [...systemMessages, ...trimmedConversation];
  }

  /**
   * Delete all sessions
   */
  deleteAllSessions(): void {
    this.sessions.clear();
  }

  /**
   * Get all session IDs
   */
  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }
}

// Export singleton instance
export const chatSessionService = new ChatSessionService();

// Export convenience functions
export const createChatSession = (config?: ZaiChatConfig) =>
  chatSessionService.createChatSession(config);

export const sendChatMessage = (
  sessionId: string,
  userMessage: string,
  options?: SendChatMessageOptions
) => chatSessionService.sendChatMessage(sessionId, userMessage, options);

export const buildChatHistory = (messages: Array<{ user: string; assistant: string }>) =>
  chatSessionService.buildChatHistory(messages);

export const trimChatHistory = (history: ZaiMessage[], maxMessages?: number) =>
  chatSessionService.trimChatHistory(history, maxMessages);
