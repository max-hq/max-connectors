/**
 * AWSSavingsPlanCoverage Resolver — Autoload fallback for SP coverage records.
 *
 * Fields are populated eagerly by SavingsPlanCoverageLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSSavingsPlanCoverage } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const SavingsPlanCoverageBasicLoader = Loader.entity({
  name: "aws-cost-explorer:savings-plan-coverage:basic",
  context: AWSCostExplorerContext,
  entity: AWSSavingsPlanCoverage,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSSavingsPlanCoverageResolver = Resolver.for(AWSSavingsPlanCoverage, {
  periodStart: SavingsPlanCoverageBasicLoader.field("periodStart"),
  periodEnd: SavingsPlanCoverageBasicLoader.field("periodEnd"),
  granularity: SavingsPlanCoverageBasicLoader.field("granularity"),
  spendCoveredBySavingsPlans: SavingsPlanCoverageBasicLoader.field("spendCoveredBySavingsPlans"),
  onDemandCost: SavingsPlanCoverageBasicLoader.field("onDemandCost"),
  totalCost: SavingsPlanCoverageBasicLoader.field("totalCost"),
  coveragePercentage: SavingsPlanCoverageBasicLoader.field("coveragePercentage"),
});
