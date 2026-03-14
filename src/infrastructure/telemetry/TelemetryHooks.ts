/**
 * Telemetry Hooks
 * Basic telemetry for monitoring Z.AI operations
 */

type TelemetryEvent =
  | "generation:start"
  | "generation:success"
  | "generation:error"
  | "streaming:start"
  | "streaming:chunk"
  | "streaming:complete"
  | "streaming:error";

type TelemetryListener = (data: {
  event: TelemetryEvent;
  timestamp: number;
  metadata?: Record<string, unknown>;
}) => void;

class TelemetryManager {
  private listeners: Set<TelemetryListener> = new Set();
  private enabled = false;

  /**
   * Enable telemetry collection
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable telemetry collection
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Add a telemetry listener
   */
  addListener(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Log a telemetry event
   */
  log(event: TelemetryEvent, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const data = {
      event,
      timestamp: Date.now(),
      metadata,
    };

    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error("Telemetry listener error:", error);
      }
    });
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Telemetry manager instance
 */
export const telemetry = new TelemetryManager();

/**
 * Hook for using telemetry in React components
 */
export function useTelemetry(enabled: boolean = true) {
  if (enabled) {
    telemetry.enable();
  } else {
    telemetry.disable();
  }

  return {
    log: telemetry.log.bind(telemetry),
    addListener: telemetry.addListener.bind(telemetry),
    isEnabled: telemetry.isEnabled.bind(telemetry),
  };
}
