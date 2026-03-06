/**
 * DatadogMetricsRoot Resolver — Loads root metadata and all collections.
 */

import { Resolver, EntityInput, Loader, Page } from "@max/core";
import {
  DatadogMetricsRoot,
  DatadogMetric,
  DatadogMetricTimeseries,
} from "../entities.js";
import { DatadogMetricsContext } from "../context.js";
import { stableId } from "../id-utils.js";
import type { DatadogClient, MetricTagConfigData } from "../datadog-client.js";

// ============================================================================
// Helpers
// ============================================================================

/** Fetch all metrics by paginating through listTagConfigurations. */
async function fetchAllMetrics(api: DatadogClient): Promise<MetricTagConfigData[]> {
  const PAGE_SIZE = 200;
  const allMetrics: MetricTagConfigData[] = [];
  let cursor: string | undefined;

  do {
    const result = await api.listMetrics(PAGE_SIZE, cursor);
    allMetrics.push(...result.data);
    cursor = result.nextCursor;
  } while (cursor);

  return allMetrics;
}

/** Check if a metric name matches any of the configured patterns. */
function matchesPatterns(metricName: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    if (pattern.endsWith("*")) {
      const prefix = pattern.slice(0, -1);
      if (metricName.startsWith(prefix)) return true;
    } else {
      if (metricName === pattern) return true;
    }
  }
  return false;
}

// ============================================================================
// Root basic loader (entity — autoload fallback for scalar fields)
// ============================================================================

export const RootBasicLoader = Loader.entity({
  name: "datadog-metrics:root:basic",
  context: DatadogMetricsContext,
  entity: DatadogMetricsRoot,
  strategy: "autoload",

  async load(ref, ctx) {
    return EntityInput.create(ref, {
      site: ctx.api.site,
    });
  },
});

// ============================================================================
// Metrics collection loader (cursor-paginated)
// ============================================================================

export const MetricsLoader = Loader.collection({
  name: "datadog-metrics:root:metrics",
  context: DatadogMetricsContext,
  entity: DatadogMetricsRoot,
  target: DatadogMetric,

  async load(_ref, _page, ctx) {
    try {
      const allMetrics = await fetchAllMetrics(ctx.api);

      const items = allMetrics.map((metric) => {
        const attrs = metric.attributes;
        const metricName = metric.id;
        const id = stableId("metric", metricName);

        return EntityInput.create(DatadogMetric.ref(id), {
          metricName,
          metricType: attrs.metricType ?? "",
          tags: (attrs.tags ?? []).join(","),
          includePercentiles: String(attrs.includePercentiles ?? false),
          createdAt: attrs.createdAt ?? "",
          modifiedAt: attrs.modifiedAt ?? "",
        });
      });

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Timeseries collection loader (fetch matching metrics, query data for each)
// ============================================================================

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

export const TimeseriesLoader = Loader.collection({
  name: "datadog-metrics:root:timeseries",
  context: DatadogMetricsContext,
  entity: DatadogMetricsRoot,
  target: DatadogMetricTimeseries,

  async load(_ref, _page, ctx) {
    try {
      const allMetrics = await fetchAllMetrics(ctx.api);
      const patterns = ctx.api.metricPatterns;
      const matching = allMetrics.filter((m) => matchesPatterns(m.id, patterns));

      const now = Math.floor(Date.now() / 1000);
      const from = now - THIRTY_DAYS_SECONDS;

      const items: EntityInput<typeof DatadogMetricTimeseries>[] = [];

      for (const metric of matching) {
        try {
          const result = await ctx.api.queryTimeseries(metric.id, from, now);

          for (const point of result.points) {
            const ts = new Date(point.timestamp).toISOString();
            const id = stableId("ts", result.metric, ts);

            items.push(
              EntityInput.create(DatadogMetricTimeseries.ref(id), {
                metricName: result.metric,
                timestamp: ts,
                value: point.value,
              }),
            );
          }
        } catch {
          // Skip metrics that fail — graceful degradation
        }
      }

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogMetricsRootResolver = Resolver.for(DatadogMetricsRoot, {
  site: RootBasicLoader.field("site"),
  metrics: MetricsLoader.field(),
  timeseries: TimeseriesLoader.field(),
});
