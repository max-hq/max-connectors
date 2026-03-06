/**
 * AWSCostRecord Resolver — Autoload fallback for cost records.
 *
 * In practice, fields are populated eagerly by CostRecordsLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSCostRecord } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const CostRecordBasicLoader = Loader.entity({
  name: "aws-cost-explorer:cost-record:basic",
  context: AWSCostExplorerContext,
  entity: AWSCostRecord,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSCostRecordResolver = Resolver.for(AWSCostRecord, {
  periodStart: CostRecordBasicLoader.field("periodStart"),
  periodEnd: CostRecordBasicLoader.field("periodEnd"),
  granularity: CostRecordBasicLoader.field("granularity"),
  service: CostRecordBasicLoader.field("service"),
  blendedCost: CostRecordBasicLoader.field("blendedCost"),
  unblendedCost: CostRecordBasicLoader.field("unblendedCost"),
  amortizedCost: CostRecordBasicLoader.field("amortizedCost"),
  usageQuantity: CostRecordBasicLoader.field("usageQuantity"),
  currency: CostRecordBasicLoader.field("currency"),
});
