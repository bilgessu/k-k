import { randomUUID } from "crypto";

export interface RequestMetrics {
  requestId: string;
  operation: string;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  tokensUsed?: number;
  status: 'success' | 'error' | 'timeout' | 'circuit_open';
  errorMessage?: string;
  agentName?: string;
}

export interface LatencyStats {
  p50: number;
  p95: number;
  p99: number;
  mean: number;
  total: number;
}

class ObservabilityService {
  private metrics: RequestMetrics[] = [];
  private readonly maxMetrics = 10000;
  
  generateRequestId(): string {
    return randomUUID();
  }
  
  startOperation(operation: string, agentName?: string): RequestMetrics {
    const metric: RequestMetrics = {
      requestId: this.generateRequestId(),
      operation,
      agentName,
      startTime: Date.now(),
      status: 'success'
    };
    
    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    return metric;
  }
  
  endOperation(
    metric: RequestMetrics, 
    status: RequestMetrics['status'],
    options?: {
      tokensUsed?: number;
      errorMessage?: string;
    }
  ): void {
    metric.endTime = Date.now();
    metric.latencyMs = metric.endTime - metric.startTime;
    metric.status = status;
    
    if (options?.tokensUsed) {
      metric.tokensUsed = options.tokensUsed;
    }
    
    if (options?.errorMessage) {
      metric.errorMessage = options.errorMessage;
    }
    
    console.log(`[${metric.requestId}] ${metric.operation} completed in ${metric.latencyMs}ms [${status}]${metric.agentName ? ` (${metric.agentName})` : ''}`);
  }
  
  getLatencyStats(operation?: string, agentName?: string): LatencyStats | null {
    let relevantMetrics = this.metrics.filter(m => 
      m.latencyMs !== undefined && 
      m.status === 'success'
    );
    
    if (operation) {
      relevantMetrics = relevantMetrics.filter(m => m.operation === operation);
    }
    
    if (agentName) {
      relevantMetrics = relevantMetrics.filter(m => m.agentName === agentName);
    }
    
    if (relevantMetrics.length === 0) {
      return null;
    }
    
    const latencies = relevantMetrics
      .map(m => m.latencyMs!)
      .sort((a, b) => a - b);
    
    const p50Index = Math.floor(latencies.length * 0.5);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p99Index = Math.floor(latencies.length * 0.99);
    
    const mean = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
    
    return {
      p50: latencies[p50Index],
      p95: latencies[p95Index],
      p99: latencies[p99Index],
      mean: Math.round(mean),
      total: latencies.length
    };
  }
  
  getErrorRate(operation?: string, agentName?: string, timeWindowMs: number = 300000): number {
    const cutoff = Date.now() - timeWindowMs;
    let relevantMetrics = this.metrics.filter(m => m.startTime >= cutoff);
    
    if (operation) {
      relevantMetrics = relevantMetrics.filter(m => m.operation === operation);
    }
    
    if (agentName) {
      relevantMetrics = relevantMetrics.filter(m => m.agentName === agentName);
    }
    
    if (relevantMetrics.length === 0) {
      return 0;
    }
    
    const errorCount = relevantMetrics.filter(m => 
      m.status === 'error' || m.status === 'timeout' || m.status === 'circuit_open'
    ).length;
    
    return (errorCount / relevantMetrics.length) * 100;
  }
  
  getTotalTokensUsed(operation?: string, agentName?: string): number {
    let relevantMetrics = this.metrics.filter(m => m.tokensUsed !== undefined);
    
    if (operation) {
      relevantMetrics = relevantMetrics.filter(m => m.operation === operation);
    }
    
    if (agentName) {
      relevantMetrics = relevantMetrics.filter(m => m.agentName === agentName);
    }
    
    return relevantMetrics.reduce((sum, m) => sum + (m.tokensUsed || 0), 0);
  }
  
  getSystemHealth(): {
    totalRequests: number;
    successRate: number;
    avgLatency: number;
    totalTokensUsed: number;
    agentStats: Record<string, {
      requests: number;
      successRate: number;
      avgLatency: number;
      tokensUsed: number;
    }>;
  } {
    const recentMetrics = this.metrics.filter(m => 
      m.startTime >= Date.now() - 300000
    );
    
    const successCount = recentMetrics.filter(m => m.status === 'success').length;
    const successRate = recentMetrics.length > 0 
      ? (successCount / recentMetrics.length) * 100 
      : 100;
    
    const latencies = recentMetrics
      .filter(m => m.latencyMs !== undefined)
      .map(m => m.latencyMs!);
    const avgLatency = latencies.length > 0
      ? Math.round(latencies.reduce((sum, val) => sum + val, 0) / latencies.length)
      : 0;
    
    const agentNames = Array.from(new Set(
      recentMetrics.filter(m => m.agentName).map(m => m.agentName!)
    ));
    
    const agentStats: Record<string, any> = {};
    
    for (const agent of agentNames) {
      const agentMetrics = recentMetrics.filter(m => m.agentName === agent);
      const agentSuccessCount = agentMetrics.filter(m => m.status === 'success').length;
      const agentLatencies = agentMetrics
        .filter(m => m.latencyMs !== undefined)
        .map(m => m.latencyMs!);
      
      agentStats[agent] = {
        requests: agentMetrics.length,
        successRate: agentMetrics.length > 0 
          ? (agentSuccessCount / agentMetrics.length) * 100 
          : 100,
        avgLatency: agentLatencies.length > 0
          ? Math.round(agentLatencies.reduce((sum, val) => sum + val, 0) / agentLatencies.length)
          : 0,
        tokensUsed: agentMetrics.reduce((sum, m) => sum + (m.tokensUsed || 0), 0)
      };
    }
    
    return {
      totalRequests: recentMetrics.length,
      successRate: Math.round(successRate * 10) / 10,
      avgLatency,
      totalTokensUsed: this.getTotalTokensUsed(),
      agentStats
    };
  }
  
  getRecentMetrics(limit: number = 50): RequestMetrics[] {
    return this.metrics.slice(-limit).reverse();
  }
}

export const observability = new ObservabilityService();

export function trackOperation<T>(
  operation: string,
  agentName: string | undefined,
  fn: (requestId: string) => Promise<T>,
  estimateTokens?: (result: T) => number
): Promise<T> {
  const metric = observability.startOperation(operation, agentName);
  
  return fn(metric.requestId)
    .then(result => {
      const tokens = estimateTokens ? estimateTokens(result) : undefined;
      observability.endOperation(metric, 'success', { tokensUsed: tokens });
      return result;
    })
    .catch(error => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const lowerMessage = errorMessage.toLowerCase();
      const status = (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) ? 'timeout' :
                     (lowerMessage.includes('circuit') || lowerMessage.includes('breaker')) ? 'circuit_open' : 'error';
      
      observability.endOperation(metric, status, { errorMessage });
      throw error;
    });
}
