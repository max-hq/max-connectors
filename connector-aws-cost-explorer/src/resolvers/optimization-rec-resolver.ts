/**
 * AWSOptimizationRec Resolver — Autoload fallback for optimization recommendations.
 *
 * Fields are populated eagerly by OptimizationRecsLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSOptimizationRec } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const OptimizationRecBasicLoader = Loader.entity({
  name: "aws-cost-explorer:optimization-rec:basic",
  context: AWSCostExplorerContext,
  entity: AWSOptimizationRec,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSOptimizationRecResolver = Resolver.for(AWSOptimizationRec, {
  recommendationId: OptimizationRecBasicLoader.field("recommendationId"),
  accountId: OptimizationRecBasicLoader.field("accountId"),
  region: OptimizationRecBasicLoader.field("region"),
  resourceId: OptimizationRecBasicLoader.field("resourceId"),
  resourceType: OptimizationRecBasicLoader.field("resourceType"),
  actionType: OptimizationRecBasicLoader.field("actionType"),
  source: OptimizationRecBasicLoader.field("source"),
  currentMonthlyCost: OptimizationRecBasicLoader.field("currentMonthlyCost"),
  estimatedMonthlyCost: OptimizationRecBasicLoader.field("estimatedMonthlyCost"),
  estimatedMonthlySavings: OptimizationRecBasicLoader.field("estimatedMonthlySavings"),
  estimatedSavingsPercentage: OptimizationRecBasicLoader.field("estimatedSavingsPercentage"),
  currency: OptimizationRecBasicLoader.field("currency"),
});
