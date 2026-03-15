/**
 * @max/connector-aws-perf-insights - AWS Performance Insights connector.
 *
 * Syncs time-series metrics, top SQL queries, top wait events, and
 * performance analysis reports from AWS Performance Insights for RDS instances.
 */

import { Context } from "@max/core";
import { ConnectorDef, ConnectorModule, Installation } from "@max/connector";
import { AWSPerfInsightsSchema } from "./schema.js";
import { AWSPerfInsightsSeeder } from "./seeder.js";
import { AWSPerfInsightsRootResolver } from "./resolvers/root-resolver.js";
import { AWSPIMetricResultResolver } from "./resolvers/metric-result-resolver.js";
import { AWSPITopSQLResolver } from "./resolvers/top-sql-resolver.js";
import { AWSPITopWaitEventResolver } from "./resolvers/top-wait-event-resolver.js";
import { AWSPIAnalysisReportResolver } from "./resolvers/analysis-report-resolver.js";
import { AWSPerfInsightsOnboarding } from "./onboarding.js";
import { AWSPerfInsightsContext } from "./context.js";
import { PIClient } from "./pi-client.js";
import { AWSAccessKeyId, AWSSecretAccessKey } from "./credentials.js";
import { AWSPerfInsightsOperations } from "./operations.js";
import type { AWSPerfInsightsConfig } from "./config.js";

// ============================================================================
// ConnectorDef
// ============================================================================

const AWSPerfInsightsDef = ConnectorDef.create<AWSPerfInsightsConfig>({
  name: "aws-perf-insights",
  displayName: "AWS Performance Insights",
  description: "AWS Performance Insights connector - syncs time-series metrics, top SQL queries, top wait events, and performance analysis reports for RDS instances",
  icon: "",
  version: "0.1.0",
  scopes: [],
  schema: AWSPerfInsightsSchema,
  onboarding: AWSPerfInsightsOnboarding,
  seeder: AWSPerfInsightsSeeder,
  resolvers: [
    AWSPerfInsightsRootResolver,
    AWSPIMetricResultResolver,
    AWSPITopSQLResolver,
    AWSPITopWaitEventResolver,
    AWSPIAnalysisReportResolver,
  ],
  operations: [...AWSPerfInsightsOperations],
});

// ============================================================================
// ConnectorModule (default export)
// ============================================================================

const AWSPerfInsightsConnector = ConnectorModule.create<AWSPerfInsightsConfig>({
  def: AWSPerfInsightsDef,
  initialise(config, platform) {
    const accessKeyIdHandle = platform.credentials.get(AWSAccessKeyId);
    const secretAccessKeyHandle = platform.credentials.get(AWSSecretAccessKey);
    const api = new PIClient(accessKeyIdHandle, secretAccessKeyHandle, config.region, config.dbResourceId);

    const ctx = Context.build(AWSPerfInsightsContext, { api });

    return Installation.create({
      context: ctx,
      async start() {
        await api.start();
        platform.credentials.startRefreshSchedulers();
      },
      async stop() {
        platform.credentials.stopRefreshSchedulers();
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

export default AWSPerfInsightsConnector;
