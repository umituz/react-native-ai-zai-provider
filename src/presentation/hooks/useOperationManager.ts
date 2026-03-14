/**
 * Operation Manager Hook
 * Manages async operations with abort capability
 */

import { useRef, useCallback, useEffect } from "react";

interface OperationState {
  operationId: string | null;
  signal: AbortSignal | null;
}

export function useOperationManager() {
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const currentOperationRef = useRef<OperationState>({
    operationId: null,
    signal: null,
  });

  /**
   * Clean up on unmount
   */
  useEffect(() => {
    return () => {
      // Abort all ongoing operations
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  /**
   * Execute an operation with abort capability
   */
  const executeOperation = useCallback(
    async <T>(operation: (signal: AbortSignal, operationId: string) => Promise<T>): Promise<T> => {
      // Create new abort controller for this operation
      const operationId = `op_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      const controller = new AbortController();

      // Store controller
      abortControllersRef.current.set(operationId, controller);
      currentOperationRef.current = {
        operationId,
        signal: controller.signal,
      };

      try {
        const result = await operation(controller.signal, operationId);

        // Clean up on success
        abortControllersRef.current.delete(operationId);

        return result;
      } catch (error) {
        // Clean up on error
        abortControllersRef.current.delete(operationId);
        throw error;
      } finally {
        // Reset current operation
        if (currentOperationRef.current?.operationId === operationId) {
          currentOperationRef.current = {
            operationId: null,
            signal: null,
          };
        }
      }
    },
    []
  );

  /**
   * Abort the current operation
   */
  const abort = useCallback(() => {
    const { operationId } = currentOperationRef.current;

    if (operationId) {
      const controller = abortControllersRef.current.get(operationId);
      if (controller) {
        controller.abort();
      }
    }
  }, []);

  /**
   * Abort a specific operation by ID
   */
  const abortOperation = useCallback((operationId: string) => {
    const controller = abortControllersRef.current.get(operationId);
    if (controller) {
      controller.abort();
    }
  }, []);

  /**
   * Abort all operations
   */
  const abortAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();
    currentOperationRef.current = {
      operationId: null,
      signal: null,
    };
  }, []);

  /**
   * Check if there's an active operation
   */
  const hasActiveOperation = useCallback(() => {
    return currentOperationRef.current.operationId !== null;
  }, []);

  return {
    executeOperation,
    abort,
    abortOperation,
    abortAll,
    hasActiveOperation,
  };
}
