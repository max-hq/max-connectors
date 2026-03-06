/**
 * AWSPIMetricResult Resolver — Autoload fallback for metric results.
 *
 * In practice, fields are populated eagerly by MetricsLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSPIMetricResult } from "../entities.js";
import { AWSPerfInsightsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const MetricResultBasicLoader = Loader.entity({
  name: "aws-perf-insights:metric-result:basic",
  context: AWSPerfInsightsContext,
  entity: AWSPIMetricResult,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSPIMetricResultResolver = Resolver.for(AWSPIMetricResult, {
  timestamp: MetricResultBasicLoader.field("timestamp"),
  metricName: MetricResultBasicLoader.field("metricName"),
  periodSeconds: MetricResultBasicLoader.field("periodSeconds"),
  value: MetricResultBasicLoader.field("value"),
  statisticType: MetricResultBasicLoader.field("statisticType"),
});
