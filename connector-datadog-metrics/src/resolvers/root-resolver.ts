/**
 * DatadogMetricsRoot Resolver — Root metadata and paginated metrics catalog.
 */

import { Resolver, EntityInput, Loader, Page } from "@max/core";
import { DatadogMetricsRoot, DatadogMetric } from "../entities.js";
import { DatadogMetricsContext } from "../context.js";
import { ListMetrics } from "../operations.js";

// ============================================================================
// Root basic loader (entity — autoload fallback for scalar fields)
// ============================================================================

export const RootBasicLoader = Loader.entity({
  name: "datadog-metrics:root:basic",
  context: DatadogMetricsContext,
  entity: DatadogMetricsRoot,
  strategy: "autoload",

  async load(ref, env) {
    return EntityInput.create(ref, {
      site: env.ctx.api.site,
    });
  },
});

// ============================================================================
// Metrics collection loader (cursor-paginated)
// ============================================================================

const PAGE_SIZE = 200;

export const MetricsLoader = Loader.collection({
  name: "datadog-metrics:root:metrics",
  context: DatadogMetricsContext,
  entity: DatadogMetricsRoot,
  target: DatadogMetric,

  async load(_ref, page, env) {
    const result = await env.ops.execute(ListMetrics, {
      pageSize: PAGE_SIZE,
      cursor: page.cursor,
    });

    const items = result.data.map((metric) => {
      const attrs = metric.attributes;
      const metricName = metric.id;

      return EntityInput.create(DatadogMetric.ref(metricName), {
        metricName,
        metricType: attrs.metricType ?? "",
        tags: (attrs.tags ?? []).join(","),
        includePercentiles: String(attrs.includePercentiles ?? false),
        createdAt: attrs.createdAt ?? "",
        modifiedAt: attrs.modifiedAt ?? "",
      });
    });

    return Page.from(items, !!result.nextCursor, result.nextCursor);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogMetricsRootResolver = Resolver.for(DatadogMetricsRoot, {
  site: RootBasicLoader.field("site"),
  metrics: MetricsLoader.field(),
});
