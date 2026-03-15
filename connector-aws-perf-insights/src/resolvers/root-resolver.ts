/**
 * AWSPerfInsightsRoot Resolver — Loads root metadata and all collections.
 */

import { Resolver, EntityInput, Loader, Page } from "@max/core";
import {
  AWSPerfInsightsRoot,
  AWSPIMetricResult,
  AWSPITopSQL,
  AWSPITopWaitEvent,
  AWSPIAnalysisReport,
} from "../entities.js";
import { AWSPerfInsightsContext } from "../context.js";
import {get7DayRange, get24HourRange, type MetricQuery, type ResourceMetricsResult} from "../pi-client.js";
import { stableId } from "../id-utils.js";
import {
  GetResourceMetrics,
  DescribeDimensionKeys,
  GetDimensionKeyDetails,
  ListAnalysisReports,
  GetAnalysisReport,
} from "../operations.js";

// ============================================================================
// Root basic loader (entity — autoload fallback for scalar fields)
// ============================================================================

export const RootBasicLoader = Loader.entity({
  name: "aws-perf-insights:root:basic",
  context: AWSPerfInsightsContext,
  entity: AWSPerfInsightsRoot,
  strategy: "autoload",

  async load(ref, env) {
    return EntityInput.create(ref, {
      region: env.ctx.api.region,
      dbResourceId: env.ctx.api.dbResourceId,
    });
  },
});

// ============================================================================
// Metrics collection loader (5 metrics × 1h for 7d + db.load at 5m for 24h)
// ============================================================================

const HOURLY_METRICS = [
  "db.load.avg",
  "db.sampledload.avg",
  "os.cpuUtilization.total.avg",
];

export const MetricsLoader = Loader.collection({
  name: "aws-perf-insights:root:metrics",
  context: AWSPerfInsightsContext,
  entity: AWSPerfInsightsRoot,
  target: AWSPIMetricResult,

  async load(_ref, _page, env) {
    const items: EntityInput<typeof AWSPIMetricResult>[] = [];

    // 7-day window at 1-hour period for all metrics
    const { start: weekStart, end: weekEnd } = get7DayRange();
    const hourlyQueries: MetricQuery[] = HOURLY_METRICS.map((m) => ({ Metric: m }));

    let nextToken: string | undefined;
    do {
      const result = await env.ops.execute(GetResourceMetrics, {
        metricQueries: hourlyQueries,
        startTime: weekStart,
        endTime: weekEnd,
        periodSeconds: 3600,
        nextToken,
      });
      nextToken = result.nextToken;

      for (const metricData of result.metricList ?? []) {
        const metricName = metricData.Key?.Metric ?? "";
        for (const dp of metricData.DataPoints ?? []) {
          const timestamp = dp.Timestamp?.toISOString() ?? "";
          const value = dp.Value ?? 0;
          const id = stableId("metric", metricName, timestamp, "3600");

          items.push(
            EntityInput.create(AWSPIMetricResult.ref(id), {
              timestamp,
              metricName,
              periodSeconds: 3600,
              value,
              statisticType: "Average",
            }),
          );
        }
      }
    } while (nextToken);

    // 24-hour window at 5-minute period for db.load only
    const { start: dayStart, end: dayEnd } = get24HourRange();
    const fineQuery: MetricQuery[] = [{ Metric: "db.load.avg" }];

    nextToken = undefined;
    do {
      const result: ResourceMetricsResult = await env.ops.execute(GetResourceMetrics, {
        metricQueries: fineQuery,
        startTime: dayStart,
        endTime: dayEnd,
        periodSeconds: 300,
        nextToken,
      });
      nextToken = result.nextToken;

      for (const metricData of result.metricList ?? []) {
        const metricName = metricData.Key?.Metric ?? "";
        for (const dp of metricData.DataPoints ?? []) {
          const timestamp = dp.Timestamp?.toISOString() ?? "";
          const value = dp.Value ?? 0;
          const id = stableId("metric", metricName, timestamp, "300");

          items.push(
            EntityInput.create(AWSPIMetricResult.ref(id), {
              timestamp,
              metricName,
              periodSeconds: 300,
              value,
              statisticType: "Average",
            }),
          );
        }
      }
    } while (nextToken);

    return Page.from(items, false, undefined);
  },
});

// ============================================================================
// Top SQL collection loader (last 24h, top 25 by db.load)
// ============================================================================

export const TopSQLLoader = Loader.collection({
  name: "aws-perf-insights:root:top-sql",
  context: AWSPerfInsightsContext,
  entity: AWSPerfInsightsRoot,
  target: AWSPITopSQL,

  async load(_ref, _page, env) {
    const items: EntityInput<typeof AWSPITopSQL>[] = [];
    const { start, end } = get24HourRange();
    const periodStart = start.toISOString();
    const periodEnd = end.toISOString();

    let nextToken: string | undefined;
    do {
      const result = await env.ops.execute(DescribeDimensionKeys, {
        metric: "db.load.avg",
        groupBy: { Group: "db.sql", Limit: 25 },
        startTime: start,
        endTime: end,
        periodSeconds: 3600,
        nextToken,
      });
      nextToken = result.nextToken;

      for (const key of result.keys ?? []) {
        const sqlId = key.Dimensions?.["db.sql.id"] ?? "";
        const dbLoad = key.Total ?? 0;

        // Fetch full SQL text
        let sqlText = key.Dimensions?.["db.sql.statement"] ?? "";
        if (sqlId && !sqlText) {
          try {
            const details = await env.ops.execute(GetDimensionKeyDetails, {
              group: "db.sql",
              keyId: sqlId,
            });
            sqlText = details.dimensions?.[0]?.Value ?? "";
          } catch {
            // If we can't get the SQL text, use the truncated version
          }
        }

        const id = stableId("topsql", sqlId, periodStart);

        items.push(
          EntityInput.create(AWSPITopSQL.ref(id), {
            sqlId,
            sqlText,
            dbLoad,
            dbLoadCpu: 0,
            dbLoadIo: 0,
            dbLoadWait: 0,
            periodStart,
            periodEnd,
          }),
        );
      }
    } while (nextToken);

    return Page.from(items, false, undefined);
  },
});

// ============================================================================
// Top Wait Events collection loader (last 24h, top 25 by db.load)
// ============================================================================

export const TopWaitEventsLoader = Loader.collection({
  name: "aws-perf-insights:root:top-wait-events",
  context: AWSPerfInsightsContext,
  entity: AWSPerfInsightsRoot,
  target: AWSPITopWaitEvent,

  async load(_ref, _page, env) {
    const items: EntityInput<typeof AWSPITopWaitEvent>[] = [];
    const { start, end } = get24HourRange();
    const periodStart = start.toISOString();
    const periodEnd = end.toISOString();

    let nextToken: string | undefined;
    do {
      const result = await env.ops.execute(DescribeDimensionKeys, {
        metric: "db.load.avg",
        groupBy: { Group: "db.wait_event", Limit: 25 },
        startTime: start,
        endTime: end,
        periodSeconds: 3600,
        nextToken,
      });
      nextToken = result.nextToken;

      for (const key of result.keys ?? []) {
        const waitEventName = key.Dimensions?.["db.wait_event.name"] ?? "";
        const waitEventType = key.Dimensions?.["db.wait_event.type"] ?? "";
        const dbLoad = key.Total ?? 0;
        const id = stableId("waitevt", waitEventName, waitEventType, periodStart);

        items.push(
          EntityInput.create(AWSPITopWaitEvent.ref(id), {
            waitEventName,
            waitEventType,
            dbLoad,
            periodStart,
            periodEnd,
          }),
        );
      }
    } while (nextToken);

    return Page.from(items, false, undefined);
  },
});

// ============================================================================
// Analysis Reports collection loader (paginated, fetch details for SUCCEEDED)
// ============================================================================

export const AnalysisReportsLoader = Loader.collection({
  name: "aws-perf-insights:root:analysis-reports",
  context: AWSPerfInsightsContext,
  entity: AWSPerfInsightsRoot,
  target: AWSPIAnalysisReport,

  async load(_ref, _page, env) {
    const items: EntityInput<typeof AWSPIAnalysisReport>[] = [];
    let nextToken: string | undefined;

    do {
      const result = await env.ops.execute(ListAnalysisReports, { nextToken });
      nextToken = result.nextToken;

      for (const report of result.reports ?? []) {
        const reportId = report.AnalysisReportId ?? "";
        const status = report.Status ?? "";
        const startTime = report.StartTime?.toISOString() ?? "";
        const endTime = report.EndTime?.toISOString() ?? "";
        const createTime = report.CreateTime?.toISOString() ?? "";
        const id = stableId("report", reportId);

        let insightsSummary = "[]";
        let recommendationsSummary = "[]";

        if (status === "SUCCEEDED") {
          try {
            const detail = await env.ops.execute(GetAnalysisReport, { reportId });
            const insights = detail.report?.Insights ?? [];
            insightsSummary = JSON.stringify(insights);

            const recommendations = insights.flatMap((i) => i.Recommendations ?? []);
            recommendationsSummary = JSON.stringify(recommendations);
          } catch {
            // If we can't fetch details, leave as empty arrays
          }
        }

        items.push(
          EntityInput.create(AWSPIAnalysisReport.ref(id), {
            reportId,
            status,
            startTime,
            endTime,
            createTime,
            insightsSummary,
            recommendationsSummary,
          }),
        );
      }
    } while (nextToken);

    return Page.from(items, false, undefined);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSPerfInsightsRootResolver = Resolver.for(AWSPerfInsightsRoot, {
  region: RootBasicLoader.field("region"),
  dbResourceId: RootBasicLoader.field("dbResourceId"),
  metrics: MetricsLoader.field(),
  topSQL: TopSQLLoader.field(),
  topWaitEvents: TopWaitEventsLoader.field(),
  analysisReports: AnalysisReportsLoader.field(),
});
