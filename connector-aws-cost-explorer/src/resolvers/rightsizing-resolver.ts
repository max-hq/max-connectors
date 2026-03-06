/**
 * AWSRightsizingRec Resolver — Autoload fallback for rightsizing recommendations.
 *
 * Fields are populated eagerly by RightsizingRecsLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSRightsizingRec } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const RightsizingRecBasicLoader = Loader.entity({
  name: "aws-cost-explorer:rightsizing-rec:basic",
  context: AWSCostExplorerContext,
  entity: AWSRightsizingRec,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSRightsizingRecResolver = Resolver.for(AWSRightsizingRec, {
  accountId: RightsizingRecBasicLoader.field("accountId"),
  rightsizingType: RightsizingRecBasicLoader.field("rightsizingType"),
  instanceId: RightsizingRecBasicLoader.field("instanceId"),
  instanceName: RightsizingRecBasicLoader.field("instanceName"),
  instanceType: RightsizingRecBasicLoader.field("instanceType"),
  region: RightsizingRecBasicLoader.field("region"),
  platform: RightsizingRecBasicLoader.field("platform"),
  currentMonthlyCost: RightsizingRecBasicLoader.field("currentMonthlyCost"),
  estimatedMonthlySavings: RightsizingRecBasicLoader.field("estimatedMonthlySavings"),
  targetInstanceType: RightsizingRecBasicLoader.field("targetInstanceType"),
  targetMonthlyCost: RightsizingRecBasicLoader.field("targetMonthlyCost"),
  findingReasonCodes: RightsizingRecBasicLoader.field("findingReasonCodes"),
  currency: RightsizingRecBasicLoader.field("currency"),
});
