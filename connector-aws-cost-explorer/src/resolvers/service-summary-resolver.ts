/**
 * AWSServiceSummary Resolver — Autoload fallback for service summaries.
 *
 * In practice, fields are populated eagerly by ServiceSummariesLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSServiceSummary } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const ServiceSummaryBasicLoader = Loader.entity({
  name: "aws-cost-explorer:service-summary:basic",
  context: AWSCostExplorerContext,
  entity: AWSServiceSummary,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSServiceSummaryResolver = Resolver.for(AWSServiceSummary, {
  service: ServiceSummaryBasicLoader.field("service"),
  totalBlendedCost: ServiceSummaryBasicLoader.field("totalBlendedCost"),
  totalUnblendedCost: ServiceSummaryBasicLoader.field("totalUnblendedCost"),
  totalUsageQuantity: ServiceSummaryBasicLoader.field("totalUsageQuantity"),
  currency: ServiceSummaryBasicLoader.field("currency"),
});
