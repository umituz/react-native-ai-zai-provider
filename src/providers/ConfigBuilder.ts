/**
 * Configuration Builder
 * Builder pattern for Z.AI configuration
 */

import type { ZaiConfig, ZaiGenerationConfig } from "../domain/entities";
import { DEFAULT_MODELS } from "../domain/entities";

/**
 * Builder for Z.AI configuration
 */
export class ConfigBuilder {
  private config: Partial<ZaiConfig> = {};

  /**
   * Set API key
   */
  withApiKey(apiKey: string): ConfigBuilder {
    this.config.apiKey = apiKey;
    return this;
  }

  /**
   * Set base URL
   */
  withBaseUrl(baseUrl: string): ConfigBuilder {
    this.config.baseUrl = baseUrl;
    return this;
  }

  /**
   * Set timeout
   */
  withTimeout(timeoutMs: number): ConfigBuilder {
    this.config.timeoutMs = timeoutMs;
    return this;
  }

  /**
   * Set default text model
   */
  withTextModel(model: string): ConfigBuilder {
    this.config.textModel = model;
    return this;
  }

  /**
   * Build configuration
   */
  build(): ZaiConfig {
    if (!this.config.apiKey) {
      throw new Error("API key is required. Use withApiKey() to set it.");
    }

    return {
      apiKey: this.config.apiKey,
      baseUrl: this.config.baseUrl,
      timeoutMs: this.config.timeoutMs,
      textModel: this.config.textModel || DEFAULT_MODELS.TEXT,
    };
  }

  /**
   * Create a new builder instance
   */
  static create(): ConfigBuilder {
    return new ConfigBuilder();
  }
}

/**
 * Builder for generation configuration
 */
export class GenerationConfigBuilder {
  private config: ZaiGenerationConfig = {};

  /**
   * Set temperature
   */
  withTemperature(temperature: number): GenerationConfigBuilder {
    this.config.temperature = temperature;
    return this;
  }

  /**
   * Set max tokens
   */
  withMaxTokens(maxTokens: number): GenerationConfigBuilder {
    this.config.maxTokens = maxTokens;
    return this;
  }

  /**
   * Set top P
   */
  withTopP(topP: number): GenerationConfigBuilder {
    this.config.topP = topP;
    return this;
  }

  /**
   * Set frequency penalty
   */
  withFrequencyPenalty(penalty: number): GenerationConfigBuilder {
    this.config.frequencyPenalty = penalty;
    return this;
  }

  /**
   * Set presence penalty
   */
  withPresencePenalty(penalty: number): GenerationConfigBuilder {
    this.config.presencePenalty = penalty;
    return this;
  }

  /**
   * Set stop sequences
   */
  withStop(stop: string[]): GenerationConfigBuilder {
    this.config.stop = stop;
    return this;
  }

  /**
   * Build configuration
   */
  build(): ZaiGenerationConfig {
    return { ...this.config };
  }

  /**
   * Create a new builder instance
   */
  static create(): GenerationConfigBuilder {
    return new GenerationConfigBuilder();
  }

  /**
   * Create a balanced configuration
   */
  static balanced(): GenerationConfigBuilder {
    return new GenerationConfigBuilder().withTemperature(0.7);
  }

  /**
   * Create a creative configuration
   */
  static creative(): GenerationConfigBuilder {
    return new GenerationConfigBuilder().withTemperature(1.0);
  }

  /**
   * Create a precise configuration
   */
  static precise(): GenerationConfigBuilder {
    return new GenerationConfigBuilder().withTemperature(0.3);
  }
}
