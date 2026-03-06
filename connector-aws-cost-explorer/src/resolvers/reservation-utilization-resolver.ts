/**
 * AWSReservationUtilization Resolver — Autoload fallback for RI utilization records.
 *
 * Fields are populated eagerly by ReservationUtilizationLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSReservationUtilization } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const ReservationUtilizationBasicLoader = Loader.entity({
  name: "aws-cost-explorer:reservation-utilization:basic",
  context: AWSCostExplorerContext,
  entity: AWSReservationUtilization,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSReservationUtilizationResolver = Resolver.for(AWSReservationUtilization, {
  periodStart: ReservationUtilizationBasicLoader.field("periodStart"),
  periodEnd: ReservationUtilizationBasicLoader.field("periodEnd"),
  granularity: ReservationUtilizationBasicLoader.field("granularity"),
  utilizationPercentage: ReservationUtilizationBasicLoader.field("utilizationPercentage"),
  purchasedHours: ReservationUtilizationBasicLoader.field("purchasedHours"),
  totalActualHours: ReservationUtilizationBasicLoader.field("totalActualHours"),
  unusedHours: ReservationUtilizationBasicLoader.field("unusedHours"),
  onDemandCostOfRIHoursUsed: ReservationUtilizationBasicLoader.field("onDemandCostOfRIHoursUsed"),
  netRISavings: ReservationUtilizationBasicLoader.field("netRISavings"),
  totalPotentialRISavings: ReservationUtilizationBasicLoader.field("totalPotentialRISavings"),
  totalAmortizedFee: ReservationUtilizationBasicLoader.field("totalAmortizedFee"),
  riCostForUnusedHours: ReservationUtilizationBasicLoader.field("riCostForUnusedHours"),
  realizedSavings: ReservationUtilizationBasicLoader.field("realizedSavings"),
  unrealizedSavings: ReservationUtilizationBasicLoader.field("unrealizedSavings"),
});
