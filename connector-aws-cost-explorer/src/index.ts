/**
 * @max/connector-aws-cost-explorer - AWS Cost Explorer connector.
 *
 * Syncs cost data, forecasts, anomalies, optimization recommendations,
 * budgets, reservation/savings plan metrics, and org accounts from AWS.
 */

import { Context } from "@max/core";
import { ConnectorDef, ConnectorModule, Installation } from "@max/connector";
import { AWSCostExplorerSchema } from "./schema.js";
import { AWSCostExplorerSeeder } from "./seeder.js";
import { AWSCostExplorerRootResolver } from "./resolvers/root-resolver.js";
import { AWSCostRecordResolver } from "./resolvers/cost-record-resolver.js";
import { AWSServiceSummaryResolver } from "./resolvers/service-summary-resolver.js";
import { AWSCostByDimensionResolver } from "./resolvers/dimension-resolver.js";
import { AWSCostForecastResolver } from "./resolvers/forecast-resolver.js";
import { AWSCostAnomalyResolver } from "./resolvers/anomaly-resolver.js";
import { AWSRightsizingRecResolver } from "./resolvers/rightsizing-resolver.js";
import { AWSReservationUtilizationResolver } from "./resolvers/reservation-utilization-resolver.js";
import { AWSSavingsPlanUtilizationResolver } from "./resolvers/savings-plan-utilization-resolver.js";
import { AWSReservationCoverageResolver } from "./resolvers/reservation-coverage-resolver.js";
import { AWSSavingsPlanCoverageResolver } from "./resolvers/savings-plan-coverage-resolver.js";
import { AWSBudgetResolver } from "./resolvers/budget-resolver.js";
import { AWSOptimizationRecResolver } from "./resolvers/optimization-rec-resolver.js";
import { AWSAccountResolver } from "./resolvers/account-resolver.js";
import { AWSCostExplorerOnboarding } from "./onboarding.js";
import { AWSCostExplorerContext } from "./context.js";
import { CostExplorerClient } from "./cost-explorer-client.js";
import { AWSAccessKeyId, AWSSecretAccessKey } from "./credentials.js";
import { AWSCostExplorerOperations } from "./operations.js";
import type { AWSCostExplorerConfig } from "./config.js";

// ============================================================================
// ConnectorDef
// ============================================================================

const AWSCostExplorerDef = ConnectorDef.create<AWSCostExplorerConfig>({
  name: "aws-cost-explorer",
  displayName: "AWS Cost Explorer",
  description: "AWS Cost Explorer connector - syncs cost data, forecasts, anomalies, optimization recommendations, budgets, and reservation/savings plan metrics",
  icon: "",
  version: "0.1.0",
  scopes: [],
  schema: AWSCostExplorerSchema,
  onboarding: AWSCostExplorerOnboarding,
  seeder: AWSCostExplorerSeeder,
  resolvers: [
    AWSCostExplorerRootResolver,
    AWSCostRecordResolver,
    AWSServiceSummaryResolver,
    AWSCostByDimensionResolver,
    AWSCostForecastResolver,
    AWSCostAnomalyResolver,
    AWSRightsizingRecResolver,
    AWSReservationUtilizationResolver,
    AWSSavingsPlanUtilizationResolver,
    AWSReservationCoverageResolver,
    AWSSavingsPlanCoverageResolver,
    AWSBudgetResolver,
    AWSOptimizationRecResolver,
    AWSAccountResolver,
  ],
  operations: [...AWSCostExplorerOperations],
});

// ============================================================================
// ConnectorModule (default export)
// ============================================================================

const AWSCostExplorerConnector = ConnectorModule.create<AWSCostExplorerConfig>({
  def: AWSCostExplorerDef,
  initialise(config, platform) {
    const accessKeyIdHandle = platform.credentials.get(AWSAccessKeyId);
    const secretAccessKeyHandle = platform.credentials.get(AWSSecretAccessKey);
    const api = new CostExplorerClient(accessKeyIdHandle, secretAccessKeyHandle, config.region);

    const ctx = Context.build(AWSCostExplorerContext, { api });

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

export default AWSCostExplorerConnector;
