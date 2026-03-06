/**
 * DatadogClient — Wraps @datadog/datadog-api-client v2 MetricsApi + v1 MetricsApi.
 *
 * v2: listTagConfigurations (metric catalog)
 * v1: queryMetrics (timeseries data)
 *
 * Lifecycle: start() resolves credentials and creates the API clients.
 */

import { client, v1, v2 } from "@datadog/datadog-api-client";
import type { CredentialHandle } from "@max/connector";
import { ErrNotStarted, ErrApiError } from "./errors.js";

// ============================================================================
// Types
// ============================================================================

export interface MetricTagConfigData {
  id: string;
  attributes: {
    metricType?: string;
    tags?: string[];
    includePercentiles?: boolean;
    createdAt?: string;
    modifiedAt?: string;
  };
}

export interface ListMetricsResult {
  data: MetricTagConfigData[];
  nextCursor?: string;
}

export interface TimeseriesPoint {
  timestamp: number;
  value: number;
}

export interface QueryTimeseriesResult {
  metric: string;
  points: TimeseriesPoint[];
}

// ============================================================================
// Error helper
// ============================================================================

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const name = (err as any).name ?? "";
    const code = (err as any).code ?? (err as any).httpStatusCode ?? "";
    const parts = [name, code, err.message].filter(Boolean);
    return parts.join(" — ");
  }
  return String(err);
}

// ============================================================================
// Datadog Client
// ============================================================================

export class DatadogClient {
  private metricsApiV2: v2.MetricsApi | null = null;
  private metricsApiV1: v1.MetricsApi | null = null;

  readonly metricPatterns: string[];

  constructor(
    private readonly apiKeyHandle: CredentialHandle<string>,
    private readonly appKeyHandle: CredentialHandle<string>,
    readonly site: string,
    metricPatterns: string,
  ) {
    this.metricPatterns = metricPatterns
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
  }

  async start(): Promise<void> {
    const apiKey = await this.apiKeyHandle.get();
    const appKey = await this.appKeyHandle.get();

    const configuration = client.createConfiguration({
      authMethods: {
        apiKeyAuth: apiKey,
        appKeyAuth: appKey,
      },
    });
    configuration.setServerVariables({ site: this.site });

    this.metricsApiV2 = new v2.MetricsApi(configuration);
    this.metricsApiV1 = new v1.MetricsApi(configuration);
  }

  private get v2Api(): v2.MetricsApi {
    if (!this.metricsApiV2) throw ErrNotStarted.create({});
    return this.metricsApiV2;
  }

  private get v1Api(): v1.MetricsApi {
    if (!this.metricsApiV1) throw ErrNotStarted.create({});
    return this.metricsApiV1;
  }

  // --------------------------------------------------------------------------
  // List Metrics (cursor-paginated via listTagConfigurations)
  // --------------------------------------------------------------------------

  async listMetrics(pageSize: number, cursor?: string): Promise<ListMetricsResult> {
    try {
      const params: any = {
        pageSize,
      };
      if (cursor) {
        params.pageCursor = cursor;
      }

      const response = await this.v2Api.listTagConfigurations(params);

      const rawData = (response.data ?? []) as any[];
      const data: MetricTagConfigData[] = rawData.map((item) => ({
        id: item.id ?? "",
        attributes: {
          metricType: item.attributes?.metricType ?? "",
          tags: item.attributes?.tags ?? [],
          includePercentiles: item.attributes?.includePercentiles ?? false,
          createdAt: item.attributes?.createdAt ?? "",
          modifiedAt: item.attributes?.modifiedAt ?? "",
        },
      }));

      const nextCursor = (response as any).meta?.pagination?.nextCursor as string | undefined;
      return { data, nextCursor };
    } catch (err) {
      throw ErrApiError.create({ reason: describeError(err) });
    }
  }

  // --------------------------------------------------------------------------
  // Query Timeseries (v1 queryMetrics)
  // --------------------------------------------------------------------------

  async queryTimeseries(metricName: string, fromSeconds: number, toSeconds: number): Promise<QueryTimeseriesResult> {
    try {
      const response = await this.v1Api.queryMetrics({
        from: fromSeconds,
        to: toSeconds,
        query: `avg:${metricName}{*}`,
      });

      const series = ((response as any).series ?? []) as any[];
      const points: TimeseriesPoint[] = [];

      for (const s of series) {
        const pointlist = (s.pointlist ?? []) as Array<[number, number | null]>;
        for (const [ts, val] of pointlist) {
          if (val !== null && val !== undefined) {
            points.push({ timestamp: ts, value: val });
          }
        }
      }

      return { metric: metricName, points };
    } catch (err) {
      throw ErrApiError.create({ reason: describeError(err) });
    }
  }

  // --------------------------------------------------------------------------
  // Health check
  // --------------------------------------------------------------------------

  async health(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.listMetrics(1);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: describeError(err) };
    }
  }
}
