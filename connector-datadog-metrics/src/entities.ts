/**
 * Datadog Metrics entity definitions.
 *
 * Ordered leaf-first to avoid forward references in const declarations.
 */

import {
  EntityDef,
  Field,
  type ScalarField,
  type CollectionField,
} from "@max/core";

// ============================================================================
// DatadogMetric (leaf — one metric from tag configurations)
// ============================================================================

export interface DatadogMetric extends EntityDef<{
  metricName: ScalarField<"string">;
  metricType: ScalarField<"string">;
  tags: ScalarField<"string">;
  includePercentiles: ScalarField<"string">;
  createdAt: ScalarField<"string">;
  modifiedAt: ScalarField<"string">;
}> {}

export const DatadogMetric: DatadogMetric = EntityDef.create("DatadogMetric", {
  metricName: Field.string(),
  metricType: Field.string(),
  tags: Field.string(),
  includePercentiles: Field.string(),
  createdAt: Field.string(),
  modifiedAt: Field.string(),
});

// ============================================================================
// DatadogMetricTimeseries (leaf — one data point for a metric)
// ============================================================================

export interface DatadogMetricTimeseries extends EntityDef<{
  metricName: ScalarField<"string">;
  timestamp: ScalarField<"string">;
  value: ScalarField<"number">;
}> {}

export const DatadogMetricTimeseries: DatadogMetricTimeseries = EntityDef.create("DatadogMetricTimeseries", {
  metricName: Field.string(),
  timestamp: Field.string(),
  value: Field.number(),
});

// ============================================================================
// DatadogMetricsRoot (root singleton — all collections)
// ============================================================================

export interface DatadogMetricsRoot extends EntityDef<{
  site: ScalarField<"string">;
  metrics: CollectionField<DatadogMetric>;
  timeseries: CollectionField<DatadogMetricTimeseries>;
}> {}

export const DatadogMetricsRoot: DatadogMetricsRoot = EntityDef.create("DatadogMetricsRoot", {
  site: Field.string(),
  metrics: Field.collection(DatadogMetric),
  timeseries: Field.collection(DatadogMetricTimeseries),
});
