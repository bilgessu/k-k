/**
 * AI Safety & Resilience Utilities
 * Implements security guardrails and reliability patterns for AI agent calls
 */

import { observability, type RequestMetrics } from './observability';

/**
 * Sanitize user input before injecting into AI prompts
 * Prevents prompt injection attacks and ensures safe prompting
 */
export function sanitizePromptInput(input: string, maxLength: number = 500): string {
  if (!input) return '';
  
  return input
    .replace(/ignore\s+previous/gi, '[FILTERED]')
    .replace(/ignore\s+all/gi, '[FILTERED]')
    .replace(/system\s*:/gi, '[FILTERED]')
    .replace(/assistant\s*:/gi, '[FILTERED]')
    .replace(/user\s*:/gi, '[FILTERED]')
    .replace(/<\|system\|>/gi, '[FILTERED]')
    .replace(/<\|assistant\|>/gi, '[FILTERED]')
    .replace(/\[INST\]/gi, '[FILTERED]')
    .replace(/\[\/INST\]/gi, '[FILTERED]')
    .substring(0, maxLength)
    .trim();
}

/**
 * Wrap a Promise with a timeout to prevent indefinite hangs
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Error message to throw on timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Simple Circuit Breaker pattern to prevent cascading failures
 * Opens after threshold failures, resets after timeout period
 */
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeoutMs: number = 60000, // 1 minute
    private readonly name: string = 'CircuitBreaker'
  ) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error(`${this.name}: Circuit breaker is OPEN - service temporarily unavailable`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        console.log(`${this.name}: Circuit breaker entering HALF_OPEN state`);
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      console.log(`${this.name}: Circuit breaker closing after successful call`);
      this.reset();
    }
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold && this.state !== 'OPEN') {
      this.state = 'OPEN';
      console.error(`${this.name}: Circuit breaker OPENED after ${this.failures} failures`);
    }
  }

  private reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  /**
   * Get current circuit breaker status
   */
  getStatus(): { state: string; failures: number } {
    return {
      state: this.state,
      failures: this.failures
    };
  }
}

/**
 * Global circuit breakers for different AI services
 */
export const geminiCircuitBreaker = new CircuitBreaker(5, 60000, 'Gemini API');
export const openaiCircuitBreaker = new CircuitBreaker(5, 60000, 'OpenAI API');

/**
 * AI call configuration defaults
 */
export const AI_TIMEOUT_MS = 7000; // 7 seconds (under p95 target)
export const MULTI_AGENT_TIMEOUT_MS = 240000; // 4 minutes (240 seconds) for complex multi-agent orchestration
export const MAX_PROMPT_LENGTH = 500;

/**
 * Tracked AI operation with observability built-in
 * Automatically tracks latency, errors, and tokens
 */
export async function trackedAIOperation<T>(
  operation: string,
  agentName: string,
  fn: (requestId: string) => Promise<T>,
  estimateTokens?: (result: T) => number
): Promise<T> {
  const metric = observability.startOperation(operation, agentName);
  
  try {
    const result = await fn(metric.requestId);
    const tokens = estimateTokens ? estimateTokens(result) : undefined;
    observability.endOperation(metric, 'success', { tokensUsed: tokens });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();
    const status = (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) ? 'timeout' :
                   (lowerMessage.includes('circuit') || lowerMessage.includes('breaker')) ? 'circuit_open' : 'error';
    
    observability.endOperation(metric, status, { errorMessage });
    throw error;
  }
}

/**
 * Export observability service for direct access
 */
export { observability };
