/**
 * Content Mapper Utilities
 * Helper functions for mapping and transforming content
 */

import type { ZaiMessage } from "../../domain/entities";

/**
 * Create a text message
 */
export function createTextMessage(content: string, role: "user" | "assistant" | "system" = "user"): ZaiMessage {
  return {
    role,
    content,
  };
}

/**
 * Create a user message
 */
export function createUserMessage(content: string): ZaiMessage {
  return createTextMessage(content, "user");
}

/**
 * Create an assistant message
 */
export function createAssistantMessage(content: string): ZaiMessage {
  return createTextMessage(content, "assistant");
}

/**
 * Create a system message
 */
export function createSystemMessage(content: string): ZaiMessage {
  return createTextMessage(content, "system");
}

/**
 * Convert a simple prompt to messages array
 */
export function promptToMessages(prompt: string, systemInstruction?: string): ZaiMessage[] {
  const messages: ZaiMessage[] = [];

  if (systemInstruction) {
    messages.push(createSystemMessage(systemInstruction));
  }

  messages.push(createUserMessage(prompt));

  return messages;
}

/**
 * Extract text from messages
 */
export function extractTextFromMessages(messages: ZaiMessage[]): string {
  return messages
    .map((m) => `[${m.role}]: ${m.content}`)
    .join("\n\n");
}

/**
 * Format messages for display
 */
export function formatMessagesForDisplay(messages: ZaiMessage[]): string {
  return messages
    .map((m) => {
      const label = m.role === "user" ? "👤 User" : m.role === "assistant" ? "🤖 Assistant" : "⚙️ System";
      return `${label}\n${m.content}`;
    })
    .join("\n\n---\n\n");
}
