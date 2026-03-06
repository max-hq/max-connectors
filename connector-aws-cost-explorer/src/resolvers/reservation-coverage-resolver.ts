/**
 * AWSReservationCoverage Resolver — Autoload fallback for RI coverage records.
 *
 * Fields are populated eagerly by ReservationCoverageLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSReservationCoverage } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const ReservationCoverageBasicLoader = Loader.entity({
  name: "aws-cost-explorer:reservation-coverage:basic",
  context: AWSCostExplorerContext,
  entity: AWSReservationCoverage,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSReservationCoverageResolver = Resolver.for(AWSReservationCoverage, {
  periodStart: ReservationCoverageBasicLoader.field("periodStart"),
  periodEnd: ReservationCoverageBasicLoader.field("periodEnd"),
  granularity: ReservationCoverageBasicLoader.field("granularity"),
  coverageHoursPercentage: ReservationCoverageBasicLoader.field("coverageHoursPercentage"),
  onDemandHours: ReservationCoverageBasicLoader.field("onDemandHours"),
  reservedHours: ReservationCoverageBasicLoader.field("reservedHours"),
  totalRunningHours: ReservationCoverageBasicLoader.field("totalRunningHours"),
  onDemandCost: ReservationCoverageBasicLoader.field("onDemandCost"),
});
