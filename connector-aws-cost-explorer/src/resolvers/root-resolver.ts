/**
 * AWSCostExplorerRoot Resolver — Loads root metadata and all collections.
 */

import { Resolver, EntityInput, Loader, Page } from "@max/core";
import {
  AWSCostExplorerRoot,
  AWSCostRecord,
  AWSServiceSummary,
  AWSCostByDimension,
  AWSCostForecast,
  AWSCostAnomaly,
  AWSRightsizingRec,
  AWSReservationUtilization,
  AWSSavingsPlanUtilization,
  AWSReservationCoverage,
  AWSSavingsPlanCoverage,
  AWSBudget,
  AWSOptimizationRec,
  AWSAccount,
} from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";
import { getMonthlyRange, getDailyRange, type CostExplorerClient, type TimePeriod } from "../cost-explorer-client.js";
import { stableId } from "../id-utils.js";
import type { Granularity, Metric } from "@aws-sdk/client-cost-explorer";

// ============================================================================
// Helpers
// ============================================================================

/** Fetch all pages of GetCostAndUsage for a given time period + granularity. */
async function fetchAllCostData(
  api: CostExplorerClient,
  timePeriod: TimePeriod,
  granularity: Granularity,
): Promise<EntityInput<typeof AWSCostRecord>[]> {
  const items: EntityInput<typeof AWSCostRecord>[] = [];
  let nextPageToken: string | undefined;

  do {
    const result = await api.getCostAndUsage(timePeriod, granularity, nextPageToken);
    nextPageToken = result.nextPageToken;

    for (const period of result.resultsByTime ?? []) {
      const periodStart = period.TimePeriod?.Start ?? "";
      const periodEnd = period.TimePeriod?.End ?? "";

      for (const group of period.Groups ?? []) {
        const service = group.Keys?.[0] ?? "Unknown";
        const metrics = group.Metrics ?? {};
        const id = stableId(periodStart, granularity, service);

        items.push(
          EntityInput.create(AWSCostRecord.ref(id), {
            periodStart,
            periodEnd,
            granularity,
            service,
            blendedCost: parseFloat(metrics.BlendedCost?.Amount ?? "0"),
            unblendedCost: parseFloat(metrics.UnblendedCost?.Amount ?? "0"),
            amortizedCost: parseFloat(metrics.AmortizedCost?.Amount ?? "0"),
            usageQuantity: parseFloat(metrics.UsageQuantity?.Amount ?? "0"),
            currency: metrics.BlendedCost?.Unit ?? "USD",
          }),
        );
      }
    }
  } while (nextPageToken);

  return items;
}

/** Fetch all pages of GetCostAndUsage grouped by an arbitrary dimension. */
async function fetchAllDimensionData(
  api: CostExplorerClient,
  timePeriod: TimePeriod,
  granularity: Granularity,
  dimensionKey: string,
): Promise<EntityInput<typeof AWSCostByDimension>[]> {
  const items: EntityInput<typeof AWSCostByDimension>[] = [];
  let nextPageToken: string | undefined;

  do {
    const result = await api.getCostAndUsageByDimension(timePeriod, granularity, dimensionKey, nextPageToken);
    nextPageToken = result.nextPageToken;

    for (const period of result.resultsByTime ?? []) {
      const periodStart = period.TimePeriod?.Start ?? "";
      const periodEnd = period.TimePeriod?.End ?? "";

      for (const group of period.Groups ?? []) {
        const dimensionValue = group.Keys?.[0] ?? "Unknown";
        const metrics = group.Metrics ?? {};
        const id = stableId("dim", dimensionKey, granularity, periodStart, dimensionValue);

        items.push(
          EntityInput.create(AWSCostByDimension.ref(id), {
            periodStart,
            periodEnd,
            granularity,
            dimension: dimensionKey,
            dimensionValue,
            blendedCost: parseFloat(metrics.BlendedCost?.Amount ?? "0"),
            unblendedCost: parseFloat(metrics.UnblendedCost?.Amount ?? "0"),
            amortizedCost: parseFloat(metrics.AmortizedCost?.Amount ?? "0"),
            usageQuantity: parseFloat(metrics.UsageQuantity?.Amount ?? "0"),
            currency: metrics.BlendedCost?.Unit ?? "USD",
          }),
        );
      }
    }
  } while (nextPageToken);

  return items;
}

// ============================================================================
// Root basic loader (entity — autoload fallback for scalar fields)
// ============================================================================

export const RootBasicLoader = Loader.entity({
  name: "aws-cost-explorer:root:basic",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  strategy: "autoload",

  async load(ref, ctx) {
    return EntityInput.create(ref, {
      region: ctx.api.region,
    });
  },
});

// ============================================================================
// Cost records collection loader (monthly 12m + daily 30d)
// ============================================================================

export const CostRecordsLoader = Loader.collection({
  name: "aws-cost-explorer:root:cost-records",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSCostRecord,

  async load(_ref, _page, ctx) {
    const monthlyItems = await fetchAllCostData(ctx.api, getMonthlyRange(), "MONTHLY");
    const dailyItems = await fetchAllCostData(ctx.api, getDailyRange(), "DAILY");

    const all = [...monthlyItems, ...dailyItems];
    return Page.from(all, false, undefined);
  },
});

// ============================================================================
// Service summaries collection loader (derived from monthly cost data)
// ============================================================================

export const ServiceSummariesLoader = Loader.collection({
  name: "aws-cost-explorer:root:services",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSServiceSummary,

  async load(_ref, _page, ctx) {
    const monthlyItems = await fetchAllCostData(ctx.api, getMonthlyRange(), "MONTHLY");

    const byService = new Map<string, {
      totalBlendedCost: number;
      totalUnblendedCost: number;
      totalUsageQuantity: number;
      currency: string;
    }>();

    for (const item of monthlyItems) {
      const fields = item.fields as Record<string, unknown>;
      const service = fields.service as string;
      const existing = byService.get(service);

      if (existing) {
        existing.totalBlendedCost += fields.blendedCost as number;
        existing.totalUnblendedCost += fields.unblendedCost as number;
        existing.totalUsageQuantity += fields.usageQuantity as number;
      } else {
        byService.set(service, {
          totalBlendedCost: fields.blendedCost as number,
          totalUnblendedCost: fields.unblendedCost as number,
          totalUsageQuantity: fields.usageQuantity as number,
          currency: fields.currency as string,
        });
      }
    }

    const summaries = Array.from(byService.entries()).map(([service, totals]) => {
      const id = stableId("summary", service);
      return EntityInput.create(AWSServiceSummary.ref(id), {
        service,
        totalBlendedCost: totals.totalBlendedCost,
        totalUnblendedCost: totals.totalUnblendedCost,
        totalUsageQuantity: totals.totalUsageQuantity,
        currency: totals.currency,
      });
    });

    return Page.from(summaries, false, undefined);
  },
});

// ============================================================================
// Cost by dimension collection loader (5 dimensions × 2 granularities)
// ============================================================================

const DIMENSION_KEYS = ["LINKED_ACCOUNT", "REGION", "INSTANCE_TYPE", "USAGE_TYPE", "PURCHASE_TYPE"];

export const CostByDimensionLoader = Loader.collection({
  name: "aws-cost-explorer:root:cost-by-dimension",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSCostByDimension,

  async load(_ref, _page, ctx) {
    try {
      const all: EntityInput<typeof AWSCostByDimension>[] = [];

      for (const dim of DIMENSION_KEYS) {
        const monthlyItems = await fetchAllDimensionData(ctx.api, getMonthlyRange(), "MONTHLY", dim);
        const dailyItems = await fetchAllDimensionData(ctx.api, getDailyRange(), "DAILY", dim);
        all.push(...monthlyItems, ...dailyItems);
      }

      return Page.from(all, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Forecasts collection loader (3 metrics, monthly, 12 months forward)
// ============================================================================

const FORECAST_METRICS: Metric[] = ["BLENDED_COST", "UNBLENDED_COST", "AMORTIZED_COST"];

export const ForecastsLoader = Loader.collection({
  name: "aws-cost-explorer:root:forecasts",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSCostForecast,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSCostForecast>[] = [];

      for (const metric of FORECAST_METRICS) {
        const result = await ctx.api.getCostForecast(metric, "MONTHLY");

        for (const entry of result.forecastResultsByTime ?? []) {
          const periodStart = entry.TimePeriod?.Start ?? "";
          const periodEnd = entry.TimePeriod?.End ?? "";
          const id = stableId("forecast", metric, periodStart);

          items.push(
            EntityInput.create(AWSCostForecast.ref(id), {
              periodStart,
              periodEnd,
              granularity: "MONTHLY",
              metric,
              meanValue: parseFloat(entry.MeanValue ?? "0"),
              lowerBound: parseFloat(entry.PredictionIntervalLowerBound ?? "0"),
              upperBound: parseFloat(entry.PredictionIntervalUpperBound ?? "0"),
              currency: "USD",
            }),
          );
        }
      }

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Anomalies collection loader (last 90 days, paginated)
// ============================================================================

export const AnomaliesLoader = Loader.collection({
  name: "aws-cost-explorer:root:anomalies",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSCostAnomaly,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSCostAnomaly>[] = [];
      let nextPageToken: string | undefined;

      do {
        const result = await ctx.api.getAnomalies(nextPageToken);
        nextPageToken = result.nextPageToken;

        for (const anomaly of result.anomalies ?? []) {
          const anomalyId = anomaly.AnomalyId ?? "";
          const rootCauses = anomaly.RootCauses ?? [];
          const firstCause = rootCauses[0];
          const impact = anomaly.Impact;
          const id = stableId("anomaly", anomalyId);

          items.push(
            EntityInput.create(AWSCostAnomaly.ref(id), {
              anomalyId,
              startDate: anomaly.AnomalyStartDate ?? "",
              endDate: anomaly.AnomalyEndDate ?? "",
              dimensionValue: anomaly.DimensionValue ?? "",
              currentScore: anomaly.AnomalyScore?.CurrentScore ?? 0,
              maxScore: anomaly.AnomalyScore?.MaxScore ?? 0,
              totalActualSpend: impact?.TotalActualSpend ?? 0,
              totalExpectedSpend: impact?.TotalExpectedSpend ?? 0,
              totalImpact: impact?.TotalImpact ?? 0,
              totalImpactPercentage: impact?.TotalImpactPercentage ?? 0,
              rootCauseService: firstCause?.Service ?? "",
              rootCauseRegion: firstCause?.Region ?? "",
              rootCauseAccount: firstCause?.LinkedAccount ?? "",
              feedback: anomaly.Feedback ?? "",
              monitorArn: anomaly.MonitorArn ?? "",
            }),
          );
        }
      } while (nextPageToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Rightsizing recommendations collection loader (paginated)
// ============================================================================

export const RightsizingRecsLoader = Loader.collection({
  name: "aws-cost-explorer:root:rightsizing-recs",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSRightsizingRec,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSRightsizingRec>[] = [];
      let nextPageToken: string | undefined;

      do {
        const result = await ctx.api.getRightsizingRecommendations(nextPageToken);
        nextPageToken = result.nextPageToken;

        for (const rec of result.recommendations ?? []) {
          const current = rec.CurrentInstance;
          const resourceDetails = current?.ResourceDetails?.EC2ResourceDetails;
          const instanceId = current?.ResourceId ?? "";
          const id = stableId("rightsizing", instanceId);

          const modifyTarget = rec.ModifyRecommendationDetail?.TargetInstances?.[0];
          const targetDetails = modifyTarget?.ResourceDetails?.EC2ResourceDetails;
          const savings = modifyTarget?.EstimatedMonthlySavings ?? rec.TerminateRecommendationDetail?.EstimatedMonthlySavings;

          items.push(
            EntityInput.create(AWSRightsizingRec.ref(id), {
              accountId: rec.AccountId ?? "",
              rightsizingType: rec.RightsizingType ?? "",
              instanceId,
              instanceName: current?.InstanceName ?? "",
              instanceType: resourceDetails?.InstanceType ?? "",
              region: resourceDetails?.Region ?? "",
              platform: resourceDetails?.Platform ?? "",
              currentMonthlyCost: parseFloat(current?.MonthlyCost ?? "0"),
              estimatedMonthlySavings: parseFloat(savings ?? "0"),
              targetInstanceType: targetDetails?.InstanceType ?? "",
              targetMonthlyCost: parseFloat(modifyTarget?.EstimatedMonthlyCost ?? "0"),
              findingReasonCodes: (rec.FindingReasonCodes ?? []).join(","),
              currency: "USD",
            }),
          );
        }
      } while (nextPageToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Reservation utilization collection loader (monthly, 12 months)
// ============================================================================

export const ReservationUtilizationLoader = Loader.collection({
  name: "aws-cost-explorer:root:reservation-utilization",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSReservationUtilization,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSReservationUtilization>[] = [];
      let nextPageToken: string | undefined;

      do {
        const result = await ctx.api.getReservationUtilization(getMonthlyRange(), "MONTHLY", nextPageToken);
        nextPageToken = result.nextPageToken;

        for (const entry of result.utilizationsByTime ?? []) {
          const periodStart = entry.TimePeriod?.Start ?? "";
          const periodEnd = entry.TimePeriod?.End ?? "";
          const total = entry.Total;
          const id = stableId("ri-util", periodStart);

          items.push(
            EntityInput.create(AWSReservationUtilization.ref(id), {
              periodStart,
              periodEnd,
              granularity: "MONTHLY",
              utilizationPercentage: parseFloat(total?.UtilizationPercentage ?? "0"),
              purchasedHours: parseFloat(total?.PurchasedHours ?? "0"),
              totalActualHours: parseFloat(total?.TotalActualHours ?? "0"),
              unusedHours: parseFloat(total?.UnusedHours ?? "0"),
              onDemandCostOfRIHoursUsed: parseFloat(total?.OnDemandCostOfRIHoursUsed ?? "0"),
              netRISavings: parseFloat(total?.NetRISavings ?? "0"),
              totalPotentialRISavings: parseFloat(total?.TotalPotentialRISavings ?? "0"),
              totalAmortizedFee: parseFloat(total?.TotalAmortizedFee ?? "0"),
              riCostForUnusedHours: parseFloat(total?.RICostForUnusedHours ?? "0"),
              realizedSavings: parseFloat(total?.RealizedSavings ?? "0"),
              unrealizedSavings: parseFloat(total?.UnrealizedSavings ?? "0"),
            }),
          );
        }
      } while (nextPageToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Savings plan utilization collection loader (monthly, 12 months, no pagination)
// ============================================================================

export const SavingsPlanUtilizationLoader = Loader.collection({
  name: "aws-cost-explorer:root:savings-plan-utilization",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSSavingsPlanUtilization,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSSavingsPlanUtilization>[] = [];

      const result = await ctx.api.getSavingsPlansUtilization(getMonthlyRange(), "MONTHLY");

      for (const entry of result.utilizationsByTime ?? []) {
        const periodStart = entry.TimePeriod?.Start ?? "";
        const periodEnd = entry.TimePeriod?.End ?? "";
        const util = entry.Utilization;
        const savings = entry.Savings;
        const amortized = entry.AmortizedCommitment;
        const id = stableId("sp-util", periodStart);

        items.push(
          EntityInput.create(AWSSavingsPlanUtilization.ref(id), {
            periodStart,
            periodEnd,
            granularity: "MONTHLY",
            totalCommitment: parseFloat(util?.TotalCommitment ?? "0"),
            usedCommitment: parseFloat(util?.UsedCommitment ?? "0"),
            unusedCommitment: parseFloat(util?.UnusedCommitment ?? "0"),
            utilizationPercentage: parseFloat(util?.UtilizationPercentage ?? "0"),
            netSavings: parseFloat(savings?.NetSavings ?? "0"),
            onDemandCostEquivalent: parseFloat(savings?.OnDemandCostEquivalent ?? "0"),
            totalAmortizedCommitment: parseFloat(amortized?.TotalAmortizedCommitment ?? "0"),
          }),
        );
      }

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Reservation coverage collection loader (monthly, 12 months)
// ============================================================================

export const ReservationCoverageLoader = Loader.collection({
  name: "aws-cost-explorer:root:reservation-coverage",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSReservationCoverage,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSReservationCoverage>[] = [];
      let nextPageToken: string | undefined;

      do {
        const result = await ctx.api.getReservationCoverage(getMonthlyRange(), "MONTHLY", nextPageToken);
        nextPageToken = result.nextPageToken;

        for (const entry of result.coveragesByTime ?? []) {
          const periodStart = entry.TimePeriod?.Start ?? "";
          const periodEnd = entry.TimePeriod?.End ?? "";
          const coverage = entry.Total?.CoverageHours;
          const id = stableId("ri-cov", periodStart);

          items.push(
            EntityInput.create(AWSReservationCoverage.ref(id), {
              periodStart,
              periodEnd,
              granularity: "MONTHLY",
              coverageHoursPercentage: parseFloat(coverage?.CoverageHoursPercentage ?? "0"),
              onDemandHours: parseFloat(coverage?.OnDemandHours ?? "0"),
              reservedHours: parseFloat(coverage?.ReservedHours ?? "0"),
              totalRunningHours: parseFloat(coverage?.TotalRunningHours ?? "0"),
              onDemandCost: parseFloat(entry.Total?.CoverageCost?.OnDemandCost ?? "0"),
            }),
          );
        }
      } while (nextPageToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Savings plan coverage collection loader (monthly, 12 months)
// ============================================================================

export const SavingsPlanCoverageLoader = Loader.collection({
  name: "aws-cost-explorer:root:savings-plan-coverage",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSSavingsPlanCoverage,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSSavingsPlanCoverage>[] = [];
      let nextToken: string | undefined;

      do {
        const result = await ctx.api.getSavingsPlansCoverage(getMonthlyRange(), "MONTHLY", nextToken);
        nextToken = result.nextToken;

        for (const entry of result.coveragesByTime ?? []) {
          const periodStart = entry.TimePeriod?.Start ?? "";
          const periodEnd = entry.TimePeriod?.End ?? "";
          const coverage = entry.Coverage;
          const id = stableId("sp-cov", periodStart);

          items.push(
            EntityInput.create(AWSSavingsPlanCoverage.ref(id), {
              periodStart,
              periodEnd,
              granularity: "MONTHLY",
              spendCoveredBySavingsPlans: parseFloat(coverage?.SpendCoveredBySavingsPlans ?? "0"),
              onDemandCost: parseFloat(coverage?.OnDemandCost ?? "0"),
              totalCost: parseFloat(coverage?.TotalCost ?? "0"),
              coveragePercentage: parseFloat(coverage?.CoveragePercentage ?? "0"),
            }),
          );
        }
      } while (nextToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Budgets collection loader (paginated)
// ============================================================================

export const BudgetsLoader = Loader.collection({
  name: "aws-cost-explorer:root:budgets",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSBudget,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSBudget>[] = [];
      let nextToken: string | undefined;

      do {
        const result = await ctx.api.getBudgets(ctx.api.accountId, nextToken);
        nextToken = result.nextToken;

        for (const budget of result.budgets ?? []) {
          const name = budget.BudgetName ?? "";
          const id = stableId("budget", name);
          const period = budget.TimePeriod;

          items.push(
            EntityInput.create(AWSBudget.ref(id), {
              budgetName: name,
              budgetType: budget.BudgetType ?? "",
              budgetLimit: parseFloat(budget.BudgetLimit?.Amount ?? "0"),
              actualSpend: parseFloat(budget.CalculatedSpend?.ActualSpend?.Amount ?? "0"),
              forecastedSpend: parseFloat(budget.CalculatedSpend?.ForecastedSpend?.Amount ?? "0"),
              timeUnit: budget.TimeUnit ?? "",
              periodStart: period?.Start?.toISOString().split("T")[0] ?? "",
              periodEnd: period?.End?.toISOString().split("T")[0] ?? "",
              currency: budget.BudgetLimit?.Unit ?? "USD",
            }),
          );
        }
      } while (nextToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Optimization recommendations collection loader (paginated)
// ============================================================================

export const OptimizationRecsLoader = Loader.collection({
  name: "aws-cost-explorer:root:optimization-recs",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSOptimizationRec,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSOptimizationRec>[] = [];
      let nextToken: string | undefined;

      do {
        const result = await ctx.api.getOptimizationRecs(nextToken);
        nextToken = result.nextToken;

        for (const rec of result.items ?? []) {
          const recId = rec.recommendationId ?? "";
          const id = stableId("opt-rec", recId);

          items.push(
            EntityInput.create(AWSOptimizationRec.ref(id), {
              recommendationId: recId,
              accountId: rec.accountId ?? "",
              region: rec.region ?? "",
              resourceId: rec.resourceId ?? "",
              resourceType: rec.currentResourceType ?? "",
              actionType: rec.actionType ?? "",
              source: rec.source ?? "",
              currentMonthlyCost: rec.estimatedMonthlyCost ?? 0,
              estimatedMonthlyCost: rec.estimatedMonthlyCost ? (rec.estimatedMonthlyCost - (rec.estimatedMonthlySavings ?? 0)) : 0,
              estimatedMonthlySavings: rec.estimatedMonthlySavings ?? 0,
              estimatedSavingsPercentage: rec.estimatedSavingsPercentage ?? 0,
              currency: rec.currencyCode ?? "USD",
            }),
          );
        }
      } while (nextToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Accounts collection loader (paginated)
// ============================================================================

export const AccountsLoader = Loader.collection({
  name: "aws-cost-explorer:root:accounts",
  context: AWSCostExplorerContext,
  entity: AWSCostExplorerRoot,
  target: AWSAccount,

  async load(_ref, _page, ctx) {
    try {
      const items: EntityInput<typeof AWSAccount>[] = [];
      let nextToken: string | undefined;

      do {
        const result = await ctx.api.getAccounts(nextToken);
        nextToken = result.nextToken;

        for (const account of result.accounts ?? []) {
          const accountId = account.Id ?? "";
          const id = stableId("account", accountId);

          items.push(
            EntityInput.create(AWSAccount.ref(id), {
              accountId,
              accountName: account.Name ?? "",
              email: account.Email ?? "",
              status: account.Status ?? "",
              joinedDate: account.JoinedTimestamp?.toISOString().split("T")[0] ?? "",
            }),
          );
        }
      } while (nextToken);

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSCostExplorerRootResolver = Resolver.for(AWSCostExplorerRoot, {
  region: RootBasicLoader.field("region"),
  costRecords: CostRecordsLoader.field(),
  services: ServiceSummariesLoader.field(),
  costByDimension: CostByDimensionLoader.field(),
  forecasts: ForecastsLoader.field(),
  anomalies: AnomaliesLoader.field(),
  rightsizingRecs: RightsizingRecsLoader.field(),
  reservationUtilization: ReservationUtilizationLoader.field(),
  savingsPlanUtilization: SavingsPlanUtilizationLoader.field(),
  reservationCoverage: ReservationCoverageLoader.field(),
  savingsPlanCoverage: SavingsPlanCoverageLoader.field(),
  budgets: BudgetsLoader.field(),
  optimizationRecs: OptimizationRecsLoader.field(),
  accounts: AccountsLoader.field(),
});
