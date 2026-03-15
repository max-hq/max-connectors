/**
 * AWSCostExplorerSeeder - Cold-start bootstrapper.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { AWSCostExplorerRoot } from "./entities.js";
import { AWSCostExplorerContext } from "./context.js";

export const AWSCostExplorerSeeder = Seeder.create({
  context: AWSCostExplorerContext,

  async seed(env) {
    const rootRef = AWSCostExplorerRoot.ref("root");

    await env.engine.store(EntityInput.create(rootRef, {
      region: env.ctx.api.region,
    }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("costRecords"),
      Step.forRoot(rootRef).loadCollection("services"),
      Step.forRoot(rootRef).loadCollection("costByDimension"),
      Step.forRoot(rootRef).loadCollection("forecasts"),
      Step.forRoot(rootRef).loadCollection("anomalies"),
      Step.forRoot(rootRef).loadCollection("rightsizingRecs"),
      Step.forRoot(rootRef).loadCollection("reservationUtilization"),
      Step.forRoot(rootRef).loadCollection("savingsPlanUtilization"),
      Step.forRoot(rootRef).loadCollection("reservationCoverage"),
      Step.forRoot(rootRef).loadCollection("savingsPlanCoverage"),
      Step.forRoot(rootRef).loadCollection("budgets"),
      Step.forRoot(rootRef).loadCollection("optimizationRecs"),
      Step.forRoot(rootRef).loadCollection("accounts"),
    ]);
  },
});
