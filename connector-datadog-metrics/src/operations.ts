/**
 * Datadog Metrics operations — typed API call tokens.
 *
 * Each operation wraps a single Datadog API call, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { DatadogMetricsContext } from "./context.js";
import type { ListMetricsResult, QueryTimeseriesResult } from "./datadog-client.js";

// ============================================================================
// Operations
// ============================================================================

export const ListMetrics = Operation.define({
  name: "datadog-metrics:metric:list",
  context: DatadogMetricsContext,
  async handle(
    input: { pageSize: number; cursor?: string },
    env,
  ): Promise<ListMetricsResult> {
    return env.ctx.api.listMetrics(input.pageSize, input.cursor);
  },
});

export const QueryTimeseries = Operation.define({
  name: "datadog-metrics:timeseries:query",
  context: DatadogMetricsContext,
  async handle(
    input: { metricName: string; fromSeconds: number; toSeconds: number },
    env,
  ): Promise<QueryTimeseriesResult> {
    return env.ctx.api.queryTimeseries(input.metricName, input.fromSeconds, input.toSeconds);
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const DatadogMetricsOperations = [
  ListMetrics,
  QueryTimeseries,
] as const;
