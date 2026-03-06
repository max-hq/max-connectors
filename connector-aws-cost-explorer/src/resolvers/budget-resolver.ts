/**
 * AWSBudget Resolver — Autoload fallback for budget records.
 *
 * Fields are populated eagerly by BudgetsLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSBudget } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const BudgetBasicLoader = Loader.entity({
  name: "aws-cost-explorer:budget:basic",
  context: AWSCostExplorerContext,
  entity: AWSBudget,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSBudgetResolver = Resolver.for(AWSBudget, {
  budgetName: BudgetBasicLoader.field("budgetName"),
  budgetType: BudgetBasicLoader.field("budgetType"),
  budgetLimit: BudgetBasicLoader.field("budgetLimit"),
  actualSpend: BudgetBasicLoader.field("actualSpend"),
  forecastedSpend: BudgetBasicLoader.field("forecastedSpend"),
  timeUnit: BudgetBasicLoader.field("timeUnit"),
  periodStart: BudgetBasicLoader.field("periodStart"),
  periodEnd: BudgetBasicLoader.field("periodEnd"),
  currency: BudgetBasicLoader.field("currency"),
});
