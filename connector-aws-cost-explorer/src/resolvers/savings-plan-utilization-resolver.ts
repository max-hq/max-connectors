/**
 * AWSSavingsPlanUtilization Resolver — Autoload fallback for SP utilization records.
 *
 * Fields are populated eagerly by SavingsPlanUtilizationLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSSavingsPlanUtilization } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const SavingsPlanUtilizationBasicLoader = Loader.entity({
  name: "aws-cost-explorer:savings-plan-utilization:basic",
  context: AWSCostExplorerContext,
  entity: AWSSavingsPlanUtilization,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSSavingsPlanUtilizationResolver = Resolver.for(AWSSavingsPlanUtilization, {
  periodStart: SavingsPlanUtilizationBasicLoader.field("periodStart"),
  periodEnd: SavingsPlanUtilizationBasicLoader.field("periodEnd"),
  granularity: SavingsPlanUtilizationBasicLoader.field("granularity"),
  totalCommitment: SavingsPlanUtilizationBasicLoader.field("totalCommitment"),
  usedCommitment: SavingsPlanUtilizationBasicLoader.field("usedCommitment"),
  unusedCommitment: SavingsPlanUtilizationBasicLoader.field("unusedCommitment"),
  utilizationPercentage: SavingsPlanUtilizationBasicLoader.field("utilizationPercentage"),
  netSavings: SavingsPlanUtilizationBasicLoader.field("netSavings"),
  onDemandCostEquivalent: SavingsPlanUtilizationBasicLoader.field("onDemandCostEquivalent"),
  totalAmortizedCommitment: SavingsPlanUtilizationBasicLoader.field("totalAmortizedCommitment"),
});
