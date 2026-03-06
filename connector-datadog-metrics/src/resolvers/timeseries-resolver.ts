/**
 * DatadogMetricTimeseries Resolver — Autoload fallback for timeseries data.
 *
 * In practice, fields are populated eagerly by TimeseriesLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { DatadogMetricTimeseries } from "../entities.js";
import { DatadogMetricsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const TimeseriesBasicLoader = Loader.entity({
  name: "datadog-metrics:timeseries:basic",
  context: DatadogMetricsContext,
  entity: DatadogMetricTimeseries,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogMetricTimeseriesResolver = Resolver.for(DatadogMetricTimeseries, {
  metricName: TimeseriesBasicLoader.field("metricName"),
  timestamp: TimeseriesBasicLoader.field("timestamp"),
  value: TimeseriesBasicLoader.field("value"),
});
