/**
 * Datadog Metrics connector schema.
 */

import { Schema } from "@max/core";
import {
  DatadogMetric,
  DatadogMetricTimeseries,
  DatadogMetricsRoot,
} from "./entities.js";

export {
  DatadogMetric,
  DatadogMetricTimeseries,
  DatadogMetricsRoot,
};

export const DatadogMetricsSchema = Schema.create({
  namespace: "datadog-metrics",
  entities: [
    DatadogMetric,
    DatadogMetricTimeseries,
    DatadogMetricsRoot,
  ],
  roots: [DatadogMetricsRoot],
});
