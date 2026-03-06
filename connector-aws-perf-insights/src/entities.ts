/**
 * AWS Performance Insights entity definitions.
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
// AWSPIMetricResult (leaf — time-series data points from GetResourceMetrics)
// ============================================================================

export interface AWSPIMetricResult extends EntityDef<{
  timestamp: ScalarField<"string">;
  metricName: ScalarField<"string">;
  periodSeconds: ScalarField<"number">;
  value: ScalarField<"number">;
  statisticType: ScalarField<"string">;
}> {}

export const AWSPIMetricResult: AWSPIMetricResult = EntityDef.create("AWSPIMetricResult", {
  timestamp: Field.string(),
  metricName: Field.string(),
  periodSeconds: Field.number(),
  value: Field.number(),
  statisticType: Field.string(),
});

// ============================================================================
// AWSPITopSQL (leaf — top SQL queries by db.load)
// ============================================================================

export interface AWSPITopSQL extends EntityDef<{
  sqlId: ScalarField<"string">;
  sqlText: ScalarField<"string">;
  dbLoad: ScalarField<"number">;
  dbLoadCpu: ScalarField<"number">;
  dbLoadIo: ScalarField<"number">;
  dbLoadWait: ScalarField<"number">;
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
}> {}

export const AWSPITopSQL: AWSPITopSQL = EntityDef.create("AWSPITopSQL", {
  sqlId: Field.string(),
  sqlText: Field.string(),
  dbLoad: Field.number(),
  dbLoadCpu: Field.number(),
  dbLoadIo: Field.number(),
  dbLoadWait: Field.number(),
  periodStart: Field.string(),
  periodEnd: Field.string(),
});

// ============================================================================
// AWSPITopWaitEvent (leaf — top wait events by db.load)
// ============================================================================

export interface AWSPITopWaitEvent extends EntityDef<{
  waitEventName: ScalarField<"string">;
  waitEventType: ScalarField<"string">;
  dbLoad: ScalarField<"number">;
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
}> {}

export const AWSPITopWaitEvent: AWSPITopWaitEvent = EntityDef.create("AWSPITopWaitEvent", {
  waitEventName: Field.string(),
  waitEventType: Field.string(),
  dbLoad: Field.number(),
  periodStart: Field.string(),
  periodEnd: Field.string(),
});

// ============================================================================
// AWSPIAnalysisReport (leaf — performance analysis reports)
// ============================================================================

export interface AWSPIAnalysisReport extends EntityDef<{
  reportId: ScalarField<"string">;
  status: ScalarField<"string">;
  startTime: ScalarField<"string">;
  endTime: ScalarField<"string">;
  createTime: ScalarField<"string">;
  insightsSummary: ScalarField<"string">;
  recommendationsSummary: ScalarField<"string">;
}> {}

export const AWSPIAnalysisReport: AWSPIAnalysisReport = EntityDef.create("AWSPIAnalysisReport", {
  reportId: Field.string(),
  status: Field.string(),
  startTime: Field.string(),
  endTime: Field.string(),
  createTime: Field.string(),
  insightsSummary: Field.string(),
  recommendationsSummary: Field.string(),
});

// ============================================================================
// AWSPerfInsightsRoot (root singleton — all collections)
// ============================================================================

export interface AWSPerfInsightsRoot extends EntityDef<{
  region: ScalarField<"string">;
  dbResourceId: ScalarField<"string">;
  metrics: CollectionField<AWSPIMetricResult>;
  topSQL: CollectionField<AWSPITopSQL>;
  topWaitEvents: CollectionField<AWSPITopWaitEvent>;
  analysisReports: CollectionField<AWSPIAnalysisReport>;
}> {}

export const AWSPerfInsightsRoot: AWSPerfInsightsRoot = EntityDef.create("AWSPerfInsightsRoot", {
  region: Field.string(),
  dbResourceId: Field.string(),
  metrics: Field.collection(AWSPIMetricResult),
  topSQL: Field.collection(AWSPITopSQL),
  topWaitEvents: Field.collection(AWSPITopWaitEvent),
  analysisReports: Field.collection(AWSPIAnalysisReport),
});
