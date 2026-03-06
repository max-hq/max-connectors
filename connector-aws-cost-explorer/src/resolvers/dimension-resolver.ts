/**
 * AWSCostByDimension Resolver — Autoload fallback for cost-by-dimension records.
 *
 * Fields are populated eagerly by CostByDimensionLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSCostByDimension } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const CostByDimensionBasicLoader = Loader.entity({
  name: "aws-cost-explorer:cost-by-dimension:basic",
  context: AWSCostExplorerContext,
  entity: AWSCostByDimension,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSCostByDimensionResolver = Resolver.for(AWSCostByDimension, {
  periodStart: CostByDimensionBasicLoader.field("periodStart"),
  periodEnd: CostByDimensionBasicLoader.field("periodEnd"),
  granularity: CostByDimensionBasicLoader.field("granularity"),
  dimension: CostByDimensionBasicLoader.field("dimension"),
  dimensionValue: CostByDimensionBasicLoader.field("dimensionValue"),
  blendedCost: CostByDimensionBasicLoader.field("blendedCost"),
  unblendedCost: CostByDimensionBasicLoader.field("unblendedCost"),
  amortizedCost: CostByDimensionBasicLoader.field("amortizedCost"),
  usageQuantity: CostByDimensionBasicLoader.field("usageQuantity"),
  currency: CostByDimensionBasicLoader.field("currency"),
});
