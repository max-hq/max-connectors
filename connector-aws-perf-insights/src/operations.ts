/**
 * AWS Performance Insights operations — typed API call tokens.
 *
 * Each operation wraps a single PI API call, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { AWSPerfInsightsContext } from "./context.js";
import type {
  ResourceMetricsResult,
  DimensionKeysResult,
  DimensionKeyDetailsResult,
  AnalysisReportsListResult,
  AnalysisReportResult,
  MetricQuery,
} from "./pi-client.js";

// ============================================================================
// Operations
// ============================================================================

export const GetResourceMetrics = Operation.define({
  name: "aws-perf-insights:metric:get-resource-metrics",
  context: AWSPerfInsightsContext,
  async handle(
    input: {
      metricQueries: MetricQuery[];
      startTime: Date;
      endTime: Date;
      periodSeconds: number;
      nextToken?: string;
    },
    env,
  ): Promise<ResourceMetricsResult> {
    return env.ctx.api.getResourceMetrics(
      input.metricQueries,
      input.startTime,
      input.endTime,
      input.periodSeconds,
      input.nextToken,
    );
  },
});

export const DescribeDimensionKeys = Operation.define({
  name: "aws-perf-insights:dimension:describe-keys",
  context: AWSPerfInsightsContext,
  async handle(
    input: {
      metric: string;
      groupBy: { Group: string; Dimensions?: string[]; Limit?: number };
      startTime: Date;
      endTime: Date;
      periodSeconds: number;
      additionalMetrics?: string[];
      nextToken?: string;
    },
    env,
  ): Promise<DimensionKeysResult> {
    return env.ctx.api.describeDimensionKeys(
      input.metric,
      input.groupBy,
      input.startTime,
      input.endTime,
      input.periodSeconds,
      input.additionalMetrics,
      input.nextToken,
    );
  },
});

export const GetDimensionKeyDetails = Operation.define({
  name: "aws-perf-insights:dimension:get-key-details",
  context: AWSPerfInsightsContext,
  async handle(
    input: { group: string; keyId: string },
    env,
  ): Promise<DimensionKeyDetailsResult> {
    return env.ctx.api.getDimensionKeyDetails(input.group, input.keyId);
  },
});

export const ListAnalysisReports = Operation.define({
  name: "aws-perf-insights:analysis-report:list",
  context: AWSPerfInsightsContext,
  async handle(
    input: { nextToken?: string },
    env,
  ): Promise<AnalysisReportsListResult> {
    return env.ctx.api.listAnalysisReports(input.nextToken);
  },
});

export const GetAnalysisReport = Operation.define({
  name: "aws-perf-insights:analysis-report:get",
  context: AWSPerfInsightsContext,
  async handle(
    input: { reportId: string },
    env,
  ): Promise<AnalysisReportResult> {
    return env.ctx.api.getAnalysisReport(input.reportId);
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const AWSPerfInsightsOperations = [
  GetResourceMetrics,
  DescribeDimensionKeys,
  GetDimensionKeyDetails,
  ListAnalysisReports,
  GetAnalysisReport,
] as const;
