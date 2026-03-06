/**
 * AWS Cost Explorer entity definitions.
 *
 * Ordered leaf-first to avoid forward references in const declarations.
 */

import {
  EntityDef,
  Field,
  type ScalarField,
  type CollectionField,
} from "@max/core";

// ============================================================================
// AWSServiceSummary (leaf — per-service totals derived from cost records)
// ============================================================================

export interface AWSServiceSummary extends EntityDef<{
  service: ScalarField<"string">;
  totalBlendedCost: ScalarField<"number">;
  totalUnblendedCost: ScalarField<"number">;
  totalUsageQuantity: ScalarField<"number">;
  currency: ScalarField<"string">;
}> {}

export const AWSServiceSummary: AWSServiceSummary = EntityDef.create("AWSServiceSummary", {
  service: Field.string(),
  totalBlendedCost: Field.number(),
  totalUnblendedCost: Field.number(),
  totalUsageQuantity: Field.number(),
  currency: Field.string(),
});

// ============================================================================
// AWSCostRecord (leaf — one (time period, service) combination)
// ============================================================================

export interface AWSCostRecord extends EntityDef<{
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  granularity: ScalarField<"string">;
  service: ScalarField<"string">;
  blendedCost: ScalarField<"number">;
  unblendedCost: ScalarField<"number">;
  amortizedCost: ScalarField<"number">;
  usageQuantity: ScalarField<"number">;
  currency: ScalarField<"string">;
}> {}

export const AWSCostRecord: AWSCostRecord = EntityDef.create("AWSCostRecord", {
  periodStart: Field.string(),
  periodEnd: Field.string(),
  granularity: Field.string(),
  service: Field.string(),
  blendedCost: Field.number(),
  unblendedCost: Field.number(),
  amortizedCost: Field.number(),
  usageQuantity: Field.number(),
  currency: Field.string(),
});

// ============================================================================
// AWSCostByDimension (leaf — cost grouped by LINKED_ACCOUNT, REGION, etc.)
// ============================================================================

export interface AWSCostByDimension extends EntityDef<{
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  granularity: ScalarField<"string">;
  dimension: ScalarField<"string">;
  dimensionValue: ScalarField<"string">;
  blendedCost: ScalarField<"number">;
  unblendedCost: ScalarField<"number">;
  amortizedCost: ScalarField<"number">;
  usageQuantity: ScalarField<"number">;
  currency: ScalarField<"string">;
}> {}

export const AWSCostByDimension: AWSCostByDimension = EntityDef.create("AWSCostByDimension", {
  periodStart: Field.string(),
  periodEnd: Field.string(),
  granularity: Field.string(),
  dimension: Field.string(),
  dimensionValue: Field.string(),
  blendedCost: Field.number(),
  unblendedCost: Field.number(),
  amortizedCost: Field.number(),
  usageQuantity: Field.number(),
  currency: Field.string(),
});

// ============================================================================
// AWSCostForecast (leaf — predicted future spend with confidence intervals)
// ============================================================================

export interface AWSCostForecast extends EntityDef<{
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  granularity: ScalarField<"string">;
  metric: ScalarField<"string">;
  meanValue: ScalarField<"number">;
  lowerBound: ScalarField<"number">;
  upperBound: ScalarField<"number">;
  currency: ScalarField<"string">;
}> {}

export const AWSCostForecast: AWSCostForecast = EntityDef.create("AWSCostForecast", {
  periodStart: Field.string(),
  periodEnd: Field.string(),
  granularity: Field.string(),
  metric: Field.string(),
  meanValue: Field.number(),
  lowerBound: Field.number(),
  upperBound: Field.number(),
  currency: Field.string(),
});

// ============================================================================
// AWSCostAnomaly (leaf — detected cost spikes with root causes)
// ============================================================================

export interface AWSCostAnomaly extends EntityDef<{
  anomalyId: ScalarField<"string">;
  startDate: ScalarField<"string">;
  endDate: ScalarField<"string">;
  dimensionValue: ScalarField<"string">;
  currentScore: ScalarField<"number">;
  maxScore: ScalarField<"number">;
  totalActualSpend: ScalarField<"number">;
  totalExpectedSpend: ScalarField<"number">;
  totalImpact: ScalarField<"number">;
  totalImpactPercentage: ScalarField<"number">;
  rootCauseService: ScalarField<"string">;
  rootCauseRegion: ScalarField<"string">;
  rootCauseAccount: ScalarField<"string">;
  feedback: ScalarField<"string">;
  monitorArn: ScalarField<"string">;
}> {}

export const AWSCostAnomaly: AWSCostAnomaly = EntityDef.create("AWSCostAnomaly", {
  anomalyId: Field.string(),
  startDate: Field.string(),
  endDate: Field.string(),
  dimensionValue: Field.string(),
  currentScore: Field.number(),
  maxScore: Field.number(),
  totalActualSpend: Field.number(),
  totalExpectedSpend: Field.number(),
  totalImpact: Field.number(),
  totalImpactPercentage: Field.number(),
  rootCauseService: Field.string(),
  rootCauseRegion: Field.string(),
  rootCauseAccount: Field.string(),
  feedback: Field.string(),
  monitorArn: Field.string(),
});

// ============================================================================
// AWSRightsizingRec (leaf — EC2 modify/terminate recommendations)
// ============================================================================

export interface AWSRightsizingRec extends EntityDef<{
  accountId: ScalarField<"string">;
  rightsizingType: ScalarField<"string">;
  instanceId: ScalarField<"string">;
  instanceName: ScalarField<"string">;
  instanceType: ScalarField<"string">;
  region: ScalarField<"string">;
  platform: ScalarField<"string">;
  currentMonthlyCost: ScalarField<"number">;
  estimatedMonthlySavings: ScalarField<"number">;
  targetInstanceType: ScalarField<"string">;
  targetMonthlyCost: ScalarField<"number">;
  findingReasonCodes: ScalarField<"string">;
  currency: ScalarField<"string">;
}> {}

export const AWSRightsizingRec: AWSRightsizingRec = EntityDef.create("AWSRightsizingRec", {
  accountId: Field.string(),
  rightsizingType: Field.string(),
  instanceId: Field.string(),
  instanceName: Field.string(),
  instanceType: Field.string(),
  region: Field.string(),
  platform: Field.string(),
  currentMonthlyCost: Field.number(),
  estimatedMonthlySavings: Field.number(),
  targetInstanceType: Field.string(),
  targetMonthlyCost: Field.number(),
  findingReasonCodes: Field.string(),
  currency: Field.string(),
});

// ============================================================================
// AWSReservationUtilization (leaf — RI efficiency metrics)
// ============================================================================

export interface AWSReservationUtilization extends EntityDef<{
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  granularity: ScalarField<"string">;
  utilizationPercentage: ScalarField<"number">;
  purchasedHours: ScalarField<"number">;
  totalActualHours: ScalarField<"number">;
  unusedHours: ScalarField<"number">;
  onDemandCostOfRIHoursUsed: ScalarField<"number">;
  netRISavings: ScalarField<"number">;
  totalPotentialRISavings: ScalarField<"number">;
  totalAmortizedFee: ScalarField<"number">;
  riCostForUnusedHours: ScalarField<"number">;
  realizedSavings: ScalarField<"number">;
  unrealizedSavings: ScalarField<"number">;
}> {}

export const AWSReservationUtilization: AWSReservationUtilization = EntityDef.create("AWSReservationUtilization", {
  periodStart: Field.string(),
  periodEnd: Field.string(),
  granularity: Field.string(),
  utilizationPercentage: Field.number(),
  purchasedHours: Field.number(),
  totalActualHours: Field.number(),
  unusedHours: Field.number(),
  onDemandCostOfRIHoursUsed: Field.number(),
  netRISavings: Field.number(),
  totalPotentialRISavings: Field.number(),
  totalAmortizedFee: Field.number(),
  riCostForUnusedHours: Field.number(),
  realizedSavings: Field.number(),
  unrealizedSavings: Field.number(),
});

// ============================================================================
// AWSSavingsPlanUtilization (leaf — SP efficiency metrics)
// ============================================================================

export interface AWSSavingsPlanUtilization extends EntityDef<{
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  granularity: ScalarField<"string">;
  totalCommitment: ScalarField<"number">;
  usedCommitment: ScalarField<"number">;
  unusedCommitment: ScalarField<"number">;
  utilizationPercentage: ScalarField<"number">;
  netSavings: ScalarField<"number">;
  onDemandCostEquivalent: ScalarField<"number">;
  totalAmortizedCommitment: ScalarField<"number">;
}> {}

export const AWSSavingsPlanUtilization: AWSSavingsPlanUtilization = EntityDef.create("AWSSavingsPlanUtilization", {
  periodStart: Field.string(),
  periodEnd: Field.string(),
  granularity: Field.string(),
  totalCommitment: Field.number(),
  usedCommitment: Field.number(),
  unusedCommitment: Field.number(),
  utilizationPercentage: Field.number(),
  netSavings: Field.number(),
  onDemandCostEquivalent: Field.number(),
  totalAmortizedCommitment: Field.number(),
});

// ============================================================================
// AWSReservationCoverage (leaf — what % of usage is RI-covered)
// ============================================================================

export interface AWSReservationCoverage extends EntityDef<{
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  granularity: ScalarField<"string">;
  coverageHoursPercentage: ScalarField<"number">;
  onDemandHours: ScalarField<"number">;
  reservedHours: ScalarField<"number">;
  totalRunningHours: ScalarField<"number">;
  onDemandCost: ScalarField<"number">;
}> {}

export const AWSReservationCoverage: AWSReservationCoverage = EntityDef.create("AWSReservationCoverage", {
  periodStart: Field.string(),
  periodEnd: Field.string(),
  granularity: Field.string(),
  coverageHoursPercentage: Field.number(),
  onDemandHours: Field.number(),
  reservedHours: Field.number(),
  totalRunningHours: Field.number(),
  onDemandCost: Field.number(),
});

// ============================================================================
// AWSSavingsPlanCoverage (leaf — what % of spend is SP-covered)
// ============================================================================

export interface AWSSavingsPlanCoverage extends EntityDef<{
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  granularity: ScalarField<"string">;
  spendCoveredBySavingsPlans: ScalarField<"number">;
  onDemandCost: ScalarField<"number">;
  totalCost: ScalarField<"number">;
  coveragePercentage: ScalarField<"number">;
}> {}

export const AWSSavingsPlanCoverage: AWSSavingsPlanCoverage = EntityDef.create("AWSSavingsPlanCoverage", {
  periodStart: Field.string(),
  periodEnd: Field.string(),
  granularity: Field.string(),
  spendCoveredBySavingsPlans: Field.number(),
  onDemandCost: Field.number(),
  totalCost: Field.number(),
  coveragePercentage: Field.number(),
});

// ============================================================================
// AWSBudget (leaf — budget vs actual tracking)
// ============================================================================

export interface AWSBudget extends EntityDef<{
  budgetName: ScalarField<"string">;
  budgetType: ScalarField<"string">;
  budgetLimit: ScalarField<"number">;
  actualSpend: ScalarField<"number">;
  forecastedSpend: ScalarField<"number">;
  timeUnit: ScalarField<"string">;
  periodStart: ScalarField<"string">;
  periodEnd: ScalarField<"string">;
  currency: ScalarField<"string">;
}> {}

export const AWSBudget: AWSBudget = EntityDef.create("AWSBudget", {
  budgetName: Field.string(),
  budgetType: Field.string(),
  budgetLimit: Field.number(),
  actualSpend: Field.number(),
  forecastedSpend: Field.number(),
  timeUnit: Field.string(),
  periodStart: Field.string(),
  periodEnd: Field.string(),
  currency: Field.string(),
});

// ============================================================================
// AWSOptimizationRec (leaf — unified recs from Cost Optimization Hub)
// ============================================================================

export interface AWSOptimizationRec extends EntityDef<{
  recommendationId: ScalarField<"string">;
  accountId: ScalarField<"string">;
  region: ScalarField<"string">;
  resourceId: ScalarField<"string">;
  resourceType: ScalarField<"string">;
  actionType: ScalarField<"string">;
  source: ScalarField<"string">;
  currentMonthlyCost: ScalarField<"number">;
  estimatedMonthlyCost: ScalarField<"number">;
  estimatedMonthlySavings: ScalarField<"number">;
  estimatedSavingsPercentage: ScalarField<"number">;
  currency: ScalarField<"string">;
}> {}

export const AWSOptimizationRec: AWSOptimizationRec = EntityDef.create("AWSOptimizationRec", {
  recommendationId: Field.string(),
  accountId: Field.string(),
  region: Field.string(),
  resourceId: Field.string(),
  resourceType: Field.string(),
  actionType: Field.string(),
  source: Field.string(),
  currentMonthlyCost: Field.number(),
  estimatedMonthlyCost: Field.number(),
  estimatedMonthlySavings: Field.number(),
  estimatedSavingsPercentage: Field.number(),
  currency: Field.string(),
});

// ============================================================================
// AWSAccount (leaf — org account names for mapping LINKED_ACCOUNT IDs)
// ============================================================================

export interface AWSAccount extends EntityDef<{
  accountId: ScalarField<"string">;
  accountName: ScalarField<"string">;
  email: ScalarField<"string">;
  status: ScalarField<"string">;
  joinedDate: ScalarField<"string">;
}> {}

export const AWSAccount: AWSAccount = EntityDef.create("AWSAccount", {
  accountId: Field.string(),
  accountName: Field.string(),
  email: Field.string(),
  status: Field.string(),
  joinedDate: Field.string(),
});

// ============================================================================
// AWSCostExplorerRoot (root singleton — all collections)
// ============================================================================

export interface AWSCostExplorerRoot extends EntityDef<{
  region: ScalarField<"string">;
  costRecords: CollectionField<AWSCostRecord>;
  services: CollectionField<AWSServiceSummary>;
  costByDimension: CollectionField<AWSCostByDimension>;
  forecasts: CollectionField<AWSCostForecast>;
  anomalies: CollectionField<AWSCostAnomaly>;
  rightsizingRecs: CollectionField<AWSRightsizingRec>;
  reservationUtilization: CollectionField<AWSReservationUtilization>;
  savingsPlanUtilization: CollectionField<AWSSavingsPlanUtilization>;
  reservationCoverage: CollectionField<AWSReservationCoverage>;
  savingsPlanCoverage: CollectionField<AWSSavingsPlanCoverage>;
  budgets: CollectionField<AWSBudget>;
  optimizationRecs: CollectionField<AWSOptimizationRec>;
  accounts: CollectionField<AWSAccount>;
}> {}

export const AWSCostExplorerRoot: AWSCostExplorerRoot = EntityDef.create("AWSCostExplorerRoot", {
  region: Field.string(),
  costRecords: Field.collection(AWSCostRecord),
  services: Field.collection(AWSServiceSummary),
  costByDimension: Field.collection(AWSCostByDimension),
  forecasts: Field.collection(AWSCostForecast),
  anomalies: Field.collection(AWSCostAnomaly),
  rightsizingRecs: Field.collection(AWSRightsizingRec),
  reservationUtilization: Field.collection(AWSReservationUtilization),
  savingsPlanUtilization: Field.collection(AWSSavingsPlanUtilization),
  reservationCoverage: Field.collection(AWSReservationCoverage),
  savingsPlanCoverage: Field.collection(AWSSavingsPlanCoverage),
  budgets: Field.collection(AWSBudget),
  optimizationRecs: Field.collection(AWSOptimizationRec),
  accounts: Field.collection(AWSAccount),
});
