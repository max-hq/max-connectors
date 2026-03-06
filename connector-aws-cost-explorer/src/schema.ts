/**
 * AWS Cost Explorer connector schema.
 */

import { Schema } from "@max/core";
import {
  AWSServiceSummary,
  AWSCostRecord,
  AWSCostByDimension,
  AWSCostForecast,
  AWSCostAnomaly,
  AWSRightsizingRec,
  AWSReservationUtilization,
  AWSSavingsPlanUtilization,
  AWSReservationCoverage,
  AWSSavingsPlanCoverage,
  AWSBudget,
  AWSOptimizationRec,
  AWSAccount,
  AWSCostExplorerRoot,
} from "./entities.js";

export {
  AWSServiceSummary,
  AWSCostRecord,
  AWSCostByDimension,
  AWSCostForecast,
  AWSCostAnomaly,
  AWSRightsizingRec,
  AWSReservationUtilization,
  AWSSavingsPlanUtilization,
  AWSReservationCoverage,
  AWSSavingsPlanCoverage,
  AWSBudget,
  AWSOptimizationRec,
  AWSAccount,
  AWSCostExplorerRoot,
};

export const AWSCostExplorerSchema = Schema.create({
  namespace: "aws-cost-explorer",
  entities: [
    AWSServiceSummary,
    AWSCostRecord,
    AWSCostByDimension,
    AWSCostForecast,
    AWSCostAnomaly,
    AWSRightsizingRec,
    AWSReservationUtilization,
    AWSSavingsPlanUtilization,
    AWSReservationCoverage,
    AWSSavingsPlanCoverage,
    AWSBudget,
    AWSOptimizationRec,
    AWSAccount,
    AWSCostExplorerRoot,
  ],
  roots: [AWSCostExplorerRoot],
});
