/**
 * @max/connector-datadog-metrics - Datadog Metrics connector.
 *
 * Syncs metric definitions from the Datadog catalog and actual
 * timeseries data (last 30 days) for configured metric patterns.
 */

import { Context } from "@max/core";
import { ConnectorDef, ConnectorModule, Installation } from "@max/connector";
import { DatadogMetricsSchema } from "./schema.js";
import { DatadogMetricsSeeder } from "./seeder.js";
import { DatadogMetricsRootResolver } from "./resolvers/root-resolver.js";
import { DatadogMetricResolver } from "./resolvers/metric-resolver.js";
import { DatadogMetricTimeseriesResolver } from "./resolvers/timeseries-resolver.js";
import { DatadogMetricsOnboarding } from "./onboarding.js";
import { DatadogMetricsContext } from "./context.js";
import { DatadogClient } from "./datadog-client.js";
import { DatadogApiKey, DatadogAppKey } from "./credentials.js";
import type { DatadogMetricsConfig } from "./config.js";

// ============================================================================
// ConnectorDef
// ============================================================================

const DatadogMetricsDef = ConnectorDef.create<DatadogMetricsConfig>({
  name: "datadog-metrics",
  displayName: "Datadog Metrics",
  description: "Datadog Metrics connector - syncs metric catalog and timeseries data for aws.* and system.* metrics",
  icon: "",
  version: "0.1.0",
  scopes: [],
  schema: DatadogMetricsSchema,
  onboarding: DatadogMetricsOnboarding,
  seeder: DatadogMetricsSeeder,
  resolvers: [
    DatadogMetricsRootResolver,
    DatadogMetricResolver,
    DatadogMetricTimeseriesResolver,
  ],
});

// ============================================================================
// ConnectorModule (default export)
// ============================================================================

const DatadogMetricsConnector = ConnectorModule.create<DatadogMetricsConfig>({
  def: DatadogMetricsDef,
  initialise(config, credentials) {
    const apiKeyHandle = credentials.get(DatadogApiKey);
    const appKeyHandle = credentials.get(DatadogAppKey);
    const api = new DatadogClient(
      apiKeyHandle,
      appKeyHandle,
      config.site,
      config.metricPatterns || "aws.*,system.*",
    );

    const ctx = Context.build(DatadogMetricsContext, { api });

    return Installation.create({
      context: ctx,
      async start() {
        await api.start();
        credentials.startRefreshSchedulers();
      },
      async stop() {
        credentials.stopRefreshSchedulers();
      },
      async health() {
        const result = await api.health();
        return result.ok
          ? { status: "healthy" }
          : { status: "unhealthy", reason: result.error ?? "Unknown error" };
      },
    });
  },
});

export default DatadogMetricsConnector;
