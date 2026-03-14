/**
 * useZai Hook
 * Main React hook for Z.AI text generation
 */

import { useState, useCallback, useMemo } from "react";
import type { ZaiGenerationConfig } from "../../domain/entities";
import { DEFAULT_MODELS } from "../../domain/entities";
import { textGeneration } from "../../infrastructure/services/TextGeneration";
import { structuredText } from "../../infrastructure/services/StructuredText";
import { streaming } from "../../infrastructure/services/Streaming";
import { executeWithState, type AsyncStateSetters } from "../../infrastructure/utils/async/execute-state.util";
import { useOperationManager } from "./useOperationManager";

export interface UseZaiOptions {
  model?: string;
  generationConfig?: ZaiGenerationConfig;
  onSuccess?: (result: string) => void;
  onError?: (error: string) => void;
}

export interface UseZaiReturn {
  // Basic generation
  generate: (prompt: string) => Promise<void>;
  generateJSON: <T>(prompt: string, schema: Record<string, unknown>) => Promise<T | null>;

  // Streaming
  generateStreaming: (
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete?: (fullText: string) => void
  ) => Promise<void>;

  // State
  result: string | null;
  jsonResult: unknown;
  isGenerating: boolean;
  error: string | null;
  streamedText: string;

  // Actions
  reset: () => void;
  abort: () => void;
}

export function useZai(options: UseZaiOptions = {}): UseZaiReturn {
  const [result, setResult] = useState<string | null>(null);
  const [jsonResult, setJsonResult] = useState<unknown>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamedText, setStreamedText] = useState("");

  const { executeOperation, abort } = useOperationManager();

  const setters: AsyncStateSetters<string, unknown> = useMemo(
    () => ({
      setIsLoading: setIsGenerating,
      setError,
      setResult,
      setSecondaryResult: setJsonResult,
    }),
    []
  );

  const callbacks = useMemo(
    () => ({ onSuccess: options.onSuccess, onError: options.onError }),
    [options.onSuccess, options.onError]
  );

  const model = options.model ?? DEFAULT_MODELS.TEXT;

  // Basic text generation
  const generate = useCallback(
    async (prompt: string) => {
      await executeOperation(async (signal, _operationId) => {
        await executeWithState(
          setters,
          callbacks,
          async () => {
            return textGeneration.generateText(
              model,
              prompt,
              options.generationConfig,
              signal
            );
          },
          (text: string) => {
            setResult(text);
          }
        );
      });
    },
    [model, options.generationConfig, setters, callbacks, executeOperation]
  );

  // JSON generation
  const generateJSON = useCallback(
    async <T>(prompt: string, schema: Record<string, unknown>): Promise<T | null> => {
      return executeOperation(async (signal, _operationId) => {
        const jsonSetters: AsyncStateSetters<unknown, unknown> = {
          setIsLoading: setIsGenerating,
          setError,
          setResult: setJsonResult,
          setSecondaryResult: (value) =>
            setResult(typeof value === "string" ? value : JSON.stringify(value)),
        };

        const jsonCallbacks = {
          onSuccess: options.onSuccess
            ? (result: unknown) => options.onSuccess?.(JSON.stringify(result))
            : undefined,
          onError: options.onError,
        };

        const operationResult = await executeWithState<unknown>(
          jsonSetters,
          jsonCallbacks,
          async () => {
            return structuredText.generateStructuredText<T>(
              model,
              prompt,
              schema,
              options.generationConfig,
              signal
            );
          },
          (parsed: unknown) => {
            setJsonResult(parsed);
            setResult(JSON.stringify(parsed, null, 2));
          }
        );

        return operationResult as T | null;
      });
    },
    [model, options.generationConfig, callbacks, executeOperation, setters]
  );

  // Streaming generation
  const generateStreaming = useCallback(
    async (
      prompt: string,
      onChunk: (chunk: string) => void,
      onComplete?: (fullText: string) => void
    ) => {
      await executeOperation(async (signal, _operationId) => {
        setIsGenerating(true);
        setError(null);
        setStreamedText("");

        try {
          const fullText = await streaming.generateStreamingText(
            model,
            prompt,
            {
              onChunk: (chunk) => {
                setStreamedText((prev) => prev + chunk);
                onChunk(chunk);
              },
              onComplete: (text) => {
                setResult(text);
                onComplete?.(text);
                callbacks.onSuccess?.(text);
              },
              onError: (errMsg) => {
                setError(errMsg);
                callbacks.onError?.(errMsg);
              },
            },
            options.generationConfig,
            signal
          );
        } catch (err) {
          // Error handling is done in callbacks
        } finally {
          setIsGenerating(false);
        }
      });
    },
    [model, options.generationConfig, callbacks, executeOperation]
  );

  // Reset state
  const reset = useCallback(() => {
    abort();
    setResult(null);
    setJsonResult(null);
    setIsGenerating(false);
    setError(null);
    setStreamedText("");
  }, [abort]);

  return {
    generate,
    generateJSON,
    generateStreaming,
    result,
    jsonResult,
    isGenerating,
    error,
    streamedText,
    reset,
    abort,
  };
}
