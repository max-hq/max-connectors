/**
 * DatadogMetric Resolver — Scalar fields + per-metric timeseries collection.
 */

import { Loader, Resolver, EntityInput, Page } from "@max/core";
import { DatadogMetric, DatadogMetricTimeseries } from "../entities.js";
import { DatadogMetricsContext } from "../context.js";
import { QueryTimeseries } from "../operations.js";
import { stableId } from "../id-utils.js";

// ============================================================================
// Helpers
// ============================================================================

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

/** Check if a metric name matches any of the configured patterns. */
function matchesPatterns(metricName: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern.endsWith("*")) {
      const prefix = pattern.slice(0, -1);
      if (metricName.startsWith(prefix)) return true;
    } else {
      if (metricName === pattern) return true;
    }
  }
  return false;
}

// ============================================================================
// Basic loader (autoload fallback — fields populated eagerly by MetricsLoader)
// ============================================================================

export const MetricBasicLoader = Loader.entity({
  name: "datadog-metrics:metric:basic",
  context: DatadogMetricsContext,
  entity: DatadogMetric,
  strategy: "autoload",

  async load(ref, _env) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Timeseries collection loader (per-metric, pattern-filtered)
// ============================================================================

export const MetricTimeseriesLoader = Loader.collection({
  name: "datadog-metrics:metric:timeseries",
  context: DatadogMetricsContext,
  entity: DatadogMetric,
  target: DatadogMetricTimeseries,

  async load(ref, _page, env) {
    const metricName = ref.id;
    const patterns = env.ctx.api.metricPatterns;

    // Skip timeseries for metrics that don't match configured patterns
    if (!matchesPatterns(metricName, patterns)) {
      return Page.from([], false, undefined);
    }

    const now = Math.floor(Date.now() / 1000);
    const from = now - THIRTY_DAYS_SECONDS;

    const result = await env.ops.execute(QueryTimeseries, {
      metricName,
      fromSeconds: from,
      toSeconds: now,
    });

    const items = result.points.map((point) => {
      const ts = new Date(point.timestamp).toISOString();
      const id = stableId("ts", result.metric, ts);

      return EntityInput.create(DatadogMetricTimeseries.ref(id), {
        metricName: result.metric,
        timestamp: ts,
        value: point.value,
      });
    });

    return Page.from(items, false, undefined);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogMetricResolver = Resolver.for(DatadogMetric, {
  metricName: MetricBasicLoader.field("metricName"),
  metricType: MetricBasicLoader.field("metricType"),
  tags: MetricBasicLoader.field("tags"),
  includePercentiles: MetricBasicLoader.field("includePercentiles"),
  createdAt: MetricBasicLoader.field("createdAt"),
  modifiedAt: MetricBasicLoader.field("modifiedAt"),
  timeseries: MetricTimeseriesLoader.field(),
});
