/**
 * DatadogMetric Resolver — Autoload fallback for metrics.
 *
 * In practice, fields are populated eagerly by MetricsLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { DatadogMetric } from "../entities.js";
import { DatadogMetricsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const MetricBasicLoader = Loader.entity({
  name: "datadog-metrics:metric:basic",
  context: DatadogMetricsContext,
  entity: DatadogMetric,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
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
});
