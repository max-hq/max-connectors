/**
 * AWS Cost Explorer operations — typed API call tokens.
 *
 * Each operation wraps a single AWS API call, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { AWSCostExplorerContext } from "./context.js";
import type { Granularity, Metric } from "@aws-sdk/client-cost-explorer";
import type {
  TimePeriod,
  CostAndUsageResult,
  CostForecastResult,
  AnomaliesResult,
  RightsizingResult,
  ReservationUtilizationResult,
  SavingsPlansUtilizationResult,
  ReservationCoverageResult,
  SavingsPlansCoverageResult,
  BudgetsResult,
  OptimizationRecsResult,
  AccountsResult,
} from "./cost-explorer-client.js";

// ============================================================================
// Operations
// ============================================================================

export const GetCostAndUsage = Operation.define({
  name: "aws-cost-explorer:cost:get-usage",
  context: AWSCostExplorerContext,
  async handle(
    input: { timePeriod: TimePeriod; granularity: Granularity; nextPageToken?: string },
    env,
  ): Promise<CostAndUsageResult> {
    return env.ctx.api.getCostAndUsage(input.timePeriod, input.granularity, input.nextPageToken);
  },
});

export const GetCostAndUsageByDimension = Operation.define({
  name: "aws-cost-explorer:cost:get-usage-by-dimension",
  context: AWSCostExplorerContext,
  async handle(
    input: { timePeriod: TimePeriod; granularity: Granularity; dimensionKey: string; nextPageToken?: string },
    env,
  ): Promise<CostAndUsageResult> {
    return env.ctx.api.getCostAndUsageByDimension(input.timePeriod, input.granularity, input.dimensionKey, input.nextPageToken);
  },
});

export const GetCostForecast = Operation.define({
  name: "aws-cost-explorer:forecast:get",
  context: AWSCostExplorerContext,
  async handle(
    input: { metric: Metric; granularity: Granularity },
    env,
  ): Promise<CostForecastResult> {
    return env.ctx.api.getCostForecast(input.metric, input.granularity);
  },
});

export const GetAnomalies = Operation.define({
  name: "aws-cost-explorer:anomaly:list",
  context: AWSCostExplorerContext,
  async handle(
    input: { nextPageToken?: string },
    env,
  ): Promise<AnomaliesResult> {
    return env.ctx.api.getAnomalies(input.nextPageToken);
  },
});

export const GetRightsizingRecommendations = Operation.define({
  name: "aws-cost-explorer:rightsizing:list",
  context: AWSCostExplorerContext,
  async handle(
    input: { nextPageToken?: string },
    env,
  ): Promise<RightsizingResult> {
    return env.ctx.api.getRightsizingRecommendations(input.nextPageToken);
  },
});

export const GetReservationUtilization = Operation.define({
  name: "aws-cost-explorer:reservation-utilization:get",
  context: AWSCostExplorerContext,
  async handle(
    input: { timePeriod: TimePeriod; granularity: Granularity; nextPageToken?: string },
    env,
  ): Promise<ReservationUtilizationResult> {
    return env.ctx.api.getReservationUtilization(input.timePeriod, input.granularity, input.nextPageToken);
  },
});

export const GetSavingsPlansUtilization = Operation.define({
  name: "aws-cost-explorer:savings-plan-utilization:get",
  context: AWSCostExplorerContext,
  async handle(
    input: { timePeriod: TimePeriod; granularity: Granularity },
    env,
  ): Promise<SavingsPlansUtilizationResult> {
    return env.ctx.api.getSavingsPlansUtilization(input.timePeriod, input.granularity);
  },
});

export const GetReservationCoverage = Operation.define({
  name: "aws-cost-explorer:reservation-coverage:get",
  context: AWSCostExplorerContext,
  async handle(
    input: { timePeriod: TimePeriod; granularity: Granularity; nextPageToken?: string },
    env,
  ): Promise<ReservationCoverageResult> {
    return env.ctx.api.getReservationCoverage(input.timePeriod, input.granularity, input.nextPageToken);
  },
});

export const GetSavingsPlansCoverage = Operation.define({
  name: "aws-cost-explorer:savings-plan-coverage:get",
  context: AWSCostExplorerContext,
  async handle(
    input: { timePeriod: TimePeriod; granularity: Granularity; nextToken?: string },
    env,
  ): Promise<SavingsPlansCoverageResult> {
    return env.ctx.api.getSavingsPlansCoverage(input.timePeriod, input.granularity, input.nextToken);
  },
});

export const GetBudgets = Operation.define({
  name: "aws-cost-explorer:budget:list",
  context: AWSCostExplorerContext,
  async handle(
    input: { accountId: string; nextToken?: string },
    env,
  ): Promise<BudgetsResult> {
    return env.ctx.api.getBudgets(input.accountId, input.nextToken);
  },
});

export const GetOptimizationRecs = Operation.define({
  name: "aws-cost-explorer:optimization-rec:list",
  context: AWSCostExplorerContext,
  async handle(
    input: { nextToken?: string },
    env,
  ): Promise<OptimizationRecsResult> {
    return env.ctx.api.getOptimizationRecs(input.nextToken);
  },
});

export const GetAccounts = Operation.define({
  name: "aws-cost-explorer:account:list",
  context: AWSCostExplorerContext,
  async handle(
    input: { nextToken?: string },
    env,
  ): Promise<AccountsResult> {
    return env.ctx.api.getAccounts(input.nextToken);
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const AWSCostExplorerOperations = [
  GetCostAndUsage,
  GetCostAndUsageByDimension,
  GetCostForecast,
  GetAnomalies,
  GetRightsizingRecommendations,
  GetReservationUtilization,
  GetSavingsPlansUtilization,
  GetReservationCoverage,
  GetSavingsPlansCoverage,
  GetBudgets,
  GetOptimizationRecs,
  GetAccounts,
] as const;
