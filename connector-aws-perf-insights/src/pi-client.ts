/**
 * PIClient — Wraps @aws-sdk/client-pi for Performance Insights API calls.
 *
 * Lifecycle: start() resolves credentials and creates the SDK client.
 */

import {
  PIClient as AWSPISDKClient,
  GetResourceMetricsCommand,
  DescribeDimensionKeysCommand,
  GetDimensionKeyDetailsCommand,
  ListPerformanceAnalysisReportsCommand,
  GetPerformanceAnalysisReportCommand,
  GetResourceMetadataCommand,
  type GetResourceMetricsCommandOutput,
  type DescribeDimensionKeysCommandOutput,
  type GetDimensionKeyDetailsCommandOutput,
  type ListPerformanceAnalysisReportsCommandOutput,
  type GetPerformanceAnalysisReportCommandOutput,
} from "@aws-sdk/client-pi";
import type { CredentialHandle } from "@max/connector";
import { ErrNotStarted, ErrApiError } from "./errors.js";

// ============================================================================
// Types
// ============================================================================

export interface MetricQuery {
  Metric: string;
  GroupBy?: { Group: string; Dimensions?: string[]; Limit?: number };
  Filter?: Record<string, string>;
}

export interface ResourceMetricsResult {
  metricList: GetResourceMetricsCommandOutput["MetricList"];
  nextToken: string | undefined;
}

export interface DimensionKeysResult {
  keys: DescribeDimensionKeysCommandOutput["Keys"];
  nextToken: string | undefined;
}

export interface DimensionKeyDetailsResult {
  dimensions: GetDimensionKeyDetailsCommandOutput["Dimensions"];
}

export interface AnalysisReportsListResult {
  reports: ListPerformanceAnalysisReportsCommandOutput["AnalysisReports"];
  nextToken: string | undefined;
}

export interface AnalysisReportResult {
  report: GetPerformanceAnalysisReportCommandOutput["AnalysisReport"];
}

// ============================================================================
// Date helpers
// ============================================================================

/** Returns { start, end } spanning the last 7 days. */
export function get7DayRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  return { start, end };
}

/** Returns { start, end } spanning the last 24 hours. */
export function get24HourRange(): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  start.setHours(start.getHours() - 24);
  return { start, end };
}

// ============================================================================
// PI Client
// ============================================================================

export class PIClient {
  private client: AWSPISDKClient | null = null;

  constructor(
    private readonly accessKeyIdHandle: CredentialHandle<string>,
    private readonly secretAccessKeyHandle: CredentialHandle<string>,
    readonly region: string,
    readonly dbResourceId: string,
  ) {}

  async start(): Promise<void> {
    const accessKeyId = await this.accessKeyIdHandle.get();
    const secretAccessKey = await this.secretAccessKeyHandle.get();
    const credentials = { accessKeyId, secretAccessKey };

    this.client = new AWSPISDKClient({ region: this.region, credentials });
  }

  private get sdk(): AWSPISDKClient {
    if (!this.client) throw ErrNotStarted.create({});
    return this.client;
  }

  // --------------------------------------------------------------------------
  // GetResourceMetrics — time-series data
  // --------------------------------------------------------------------------

  async getResourceMetrics(
    metricQueries: MetricQuery[],
    startTime: Date,
    endTime: Date,
    periodSeconds: number,
    nextToken?: string,
  ): Promise<ResourceMetricsResult> {
    try {
      const output = await this.sdk.send(
        new GetResourceMetricsCommand({
          ServiceType: "RDS",
          Identifier: this.dbResourceId,
          MetricQueries: metricQueries,
          StartTime: startTime,
          EndTime: endTime,
          PeriodInSeconds: periodSeconds,
          NextToken: nextToken,
        }),
      );
      return {
        metricList: output.MetricList,
        nextToken: output.NextToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // DescribeDimensionKeys — top-N dimensions by metric
  // --------------------------------------------------------------------------

  async describeDimensionKeys(
    metric: string,
    groupBy: { Group: string; Dimensions?: string[]; Limit?: number },
    startTime: Date,
    endTime: Date,
    periodSeconds: number,
    additionalMetrics?: string[],
    nextToken?: string,
  ): Promise<DimensionKeysResult> {
    try {
      const output = await this.sdk.send(
        new DescribeDimensionKeysCommand({
          ServiceType: "RDS",
          Identifier: this.dbResourceId,
          Metric: metric,
          GroupBy: groupBy,
          StartTime: startTime,
          EndTime: endTime,
          PeriodInSeconds: periodSeconds,
          AdditionalMetrics: additionalMetrics,
          NextToken: nextToken,
        }),
      );
      return {
        keys: output.Keys,
        nextToken: output.NextToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetDimensionKeyDetails — full SQL text for a SQL digest
  // --------------------------------------------------------------------------

  async getDimensionKeyDetails(
    group: string,
    keyId: string,
  ): Promise<DimensionKeyDetailsResult> {
    try {
      const output = await this.sdk.send(
        new GetDimensionKeyDetailsCommand({
          ServiceType: "RDS",
          Identifier: this.dbResourceId,
          Group: group,
          GroupIdentifier: keyId,
          RequestedDimensions: ["db.sql.statement"],
        }),
      );
      return {
        dimensions: output.Dimensions,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // ListPerformanceAnalysisReports — list reports
  // --------------------------------------------------------------------------

  async listAnalysisReports(
    nextToken?: string,
  ): Promise<AnalysisReportsListResult> {
    try {
      const output = await this.sdk.send(
        new ListPerformanceAnalysisReportsCommand({
          ServiceType: "RDS",
          Identifier: this.dbResourceId,
          NextToken: nextToken,
        }),
      );
      return {
        reports: output.AnalysisReports,
        nextToken: output.NextToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetPerformanceAnalysisReport — get report with insights
  // --------------------------------------------------------------------------

  async getAnalysisReport(
    reportId: string,
  ): Promise<AnalysisReportResult> {
    try {
      const output = await this.sdk.send(
        new GetPerformanceAnalysisReportCommand({
          ServiceType: "RDS",
          Identifier: this.dbResourceId,
          AnalysisReportId: reportId,
        }),
      );
      return {
        report: output.AnalysisReport,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // Health check — GetResourceMetadata to verify PI is enabled
  // --------------------------------------------------------------------------

  async health(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.sdk.send(
        new GetResourceMetadataCommand({
          ServiceType: "RDS",
          Identifier: this.dbResourceId,
        }),
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}
