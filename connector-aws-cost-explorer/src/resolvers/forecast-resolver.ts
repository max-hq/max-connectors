/**
 * AWSCostForecast Resolver — Autoload fallback for forecast records.
 *
 * Fields are populated eagerly by ForecastsLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSCostForecast } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const CostForecastBasicLoader = Loader.entity({
  name: "aws-cost-explorer:cost-forecast:basic",
  context: AWSCostExplorerContext,
  entity: AWSCostForecast,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSCostForecastResolver = Resolver.for(AWSCostForecast, {
  periodStart: CostForecastBasicLoader.field("periodStart"),
  periodEnd: CostForecastBasicLoader.field("periodEnd"),
  granularity: CostForecastBasicLoader.field("granularity"),
  metric: CostForecastBasicLoader.field("metric"),
  meanValue: CostForecastBasicLoader.field("meanValue"),
  lowerBound: CostForecastBasicLoader.field("lowerBound"),
  upperBound: CostForecastBasicLoader.field("upperBound"),
  currency: CostForecastBasicLoader.field("currency"),
});
