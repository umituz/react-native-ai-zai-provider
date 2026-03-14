/**
 * Model Types and Configurations
 */

import { ZAI_MODELS } from "./zai.types";

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  /** Supports streaming */
  streaming: boolean;
  /** Supports function calling */
  functionCalling: boolean;
  /** Supports vision */
  vision: boolean;
  /** Maximum context length */
  maxContextLength: number;
  /** Supports system instructions */
  systemInstructions: boolean;
}

/**
 * Model information
 */
export interface ModelInfo {
  /** Model ID */
  id: string;
  /** Display name */
  name: string;
  /** Model capabilities */
  capabilities: ModelCapabilities;
  /** Recommended temperature range */
  temperatureRange: [number, number];
}

/**
 * Model registry with capabilities
 */
export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  [ZAI_MODELS.GLM_4_7]: {
    id: ZAI_MODELS.GLM_4_7,
    name: "GLM-4.7",
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: false,
      maxContextLength: 128000,
      systemInstructions: true,
    },
    temperatureRange: [0.0, 2.0],
  },
  [ZAI_MODELS.GLM_4_6]: {
    id: ZAI_MODELS.GLM_4_6,
    name: "GLM-4.6",
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: false,
      maxContextLength: 128000,
      systemInstructions: true,
    },
    temperatureRange: [0.0, 2.0],
  },
  [ZAI_MODELS.GLM_4_5]: {
    id: ZAI_MODELS.GLM_4_5,
    name: "GLM-4.5",
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: false,
      maxContextLength: 128000,
      systemInstructions: true,
    },
    temperatureRange: [0.0, 2.0],
  },
  [ZAI_MODELS.GLM_4_6V]: {
    id: ZAI_MODELS.GLM_4_6V,
    name: "GLM-4.6V (Vision)",
    capabilities: {
      streaming: true,
      functionCalling: false,
      vision: true,
      maxContextLength: 128000,
      systemInstructions: true,
    },
    temperatureRange: [0.0, 2.0],
  },
  [ZAI_MODELS.GLM_4_32B]: {
    id: ZAI_MODELS.GLM_4_32B,
    name: "GLM-4-32B",
    capabilities: {
      streaming: true,
      functionCalling: true,
      vision: false,
      maxContextLength: 128000,
      systemInstructions: true,
    },
    temperatureRange: [0.0, 2.0],
  },
};

/**
 * Get model information
 */
export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODEL_REGISTRY[modelId];
}

/**
 * Check if model supports a capability
 */
export function modelSupports(modelId: string, capability: keyof ModelCapabilities): boolean {
  const info = getModelInfo(modelId);
  return Boolean(info?.capabilities[capability]);
}
