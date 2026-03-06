/**
 * AWSCostAnomaly Resolver — Autoload fallback for anomaly records.
 *
 * Fields are populated eagerly by AnomaliesLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSCostAnomaly } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const CostAnomalyBasicLoader = Loader.entity({
  name: "aws-cost-explorer:cost-anomaly:basic",
  context: AWSCostExplorerContext,
  entity: AWSCostAnomaly,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSCostAnomalyResolver = Resolver.for(AWSCostAnomaly, {
  anomalyId: CostAnomalyBasicLoader.field("anomalyId"),
  startDate: CostAnomalyBasicLoader.field("startDate"),
  endDate: CostAnomalyBasicLoader.field("endDate"),
  dimensionValue: CostAnomalyBasicLoader.field("dimensionValue"),
  currentScore: CostAnomalyBasicLoader.field("currentScore"),
  maxScore: CostAnomalyBasicLoader.field("maxScore"),
  totalActualSpend: CostAnomalyBasicLoader.field("totalActualSpend"),
  totalExpectedSpend: CostAnomalyBasicLoader.field("totalExpectedSpend"),
  totalImpact: CostAnomalyBasicLoader.field("totalImpact"),
  totalImpactPercentage: CostAnomalyBasicLoader.field("totalImpactPercentage"),
  rootCauseService: CostAnomalyBasicLoader.field("rootCauseService"),
  rootCauseRegion: CostAnomalyBasicLoader.field("rootCauseRegion"),
  rootCauseAccount: CostAnomalyBasicLoader.field("rootCauseAccount"),
  feedback: CostAnomalyBasicLoader.field("feedback"),
  monitorArn: CostAnomalyBasicLoader.field("monitorArn"),
});
