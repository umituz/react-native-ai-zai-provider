/**
 * Provider Factory
 * Factory for creating configured Z.AI provider instances
 */

import type { ZaiConfig, ZaiGenerationConfig } from "../domain/entities";
import { zaiHttpClient } from "../infrastructure/services/ZaiClient";
import { ConfigBuilder, GenerationConfigBuilder } from "./ConfigBuilder";

/**
 * Provider configuration options
 */
export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  defaultModel?: string;
}

/**
 * Provider factory options
 */
export interface ProviderFactoryOptions {
  enableTelemetry?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Initialize Z.AI provider with configuration
 */
export function initializeProvider(config: ProviderConfig): void {
  zaiHttpClient.initialize({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
    textModel: config.defaultModel,
  });
}

/**
 * Provider factory - creates configured provider instances
 */
export const providerFactory = {
  /**
   * Create a new provider instance
   */
  create(config: ProviderConfig): void {
    initializeProvider(config);
  },

  /**
   * Create provider from environment variables
   */
  fromEnv(): void {
    const apiKey = process.env.ZAI_API_KEY;

    if (!apiKey) {
      throw new Error("ZAI_API_KEY environment variable is not set");
    }

    initializeProvider({
      apiKey,
      baseUrl: process.env.ZAI_BASE_URL,
      timeoutMs: process.env.ZAI_TIMEOUT_MS ? parseInt(process.env.ZAI_TIMEOUT_MS) : undefined,
    });
  },

  /**
   * Reset provider (clear configuration)
   */
  reset(): void {
    zaiHttpClient.reset();
  },

  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean {
    return zaiHttpClient.isInitialized();
  },
};

/**
 * Convenience function to initialize provider
 */
export function configureProvider(config: ProviderConfig): void {
  providerFactory.create(config);
}

/**
 * Convenience function to reset provider
 */
export function resetProvider(): void {
  providerFactory.reset();
}

// Re-export builders
export { ConfigBuilder, GenerationConfigBuilder };
