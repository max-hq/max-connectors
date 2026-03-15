/**
 * AWSPIAnalysisReport Resolver — Autoload fallback for analysis reports.
 *
 * In practice, fields are populated eagerly by AnalysisReportsLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSPIAnalysisReport } from "../entities.js";
import { AWSPerfInsightsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const AnalysisReportBasicLoader = Loader.entity({
  name: "aws-perf-insights:analysis-report:basic",
  context: AWSPerfInsightsContext,
  entity: AWSPIAnalysisReport,
  strategy: "autoload",

  async load(ref, _env) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSPIAnalysisReportResolver = Resolver.for(AWSPIAnalysisReport, {
  reportId: AnalysisReportBasicLoader.field("reportId"),
  status: AnalysisReportBasicLoader.field("status"),
  startTime: AnalysisReportBasicLoader.field("startTime"),
  endTime: AnalysisReportBasicLoader.field("endTime"),
  createTime: AnalysisReportBasicLoader.field("createTime"),
  insightsSummary: AnalysisReportBasicLoader.field("insightsSummary"),
  recommendationsSummary: AnalysisReportBasicLoader.field("recommendationsSummary"),
});
