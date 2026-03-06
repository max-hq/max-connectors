/**
 * AWS Performance Insights connector schema.
 */

import { Schema } from "@max/core";
import {
  AWSPIMetricResult,
  AWSPITopSQL,
  AWSPITopWaitEvent,
  AWSPIAnalysisReport,
  AWSPerfInsightsRoot,
} from "./entities.js";

export {
  AWSPIMetricResult,
  AWSPITopSQL,
  AWSPITopWaitEvent,
  AWSPIAnalysisReport,
  AWSPerfInsightsRoot,
};

export const AWSPerfInsightsSchema = Schema.create({
  namespace: "aws-perf-insights",
  entities: [
    AWSPIMetricResult,
    AWSPITopSQL,
    AWSPITopWaitEvent,
    AWSPIAnalysisReport,
    AWSPerfInsightsRoot,
  ],
  roots: [AWSPerfInsightsRoot],
});
