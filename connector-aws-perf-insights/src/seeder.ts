/**
 * AWSPerfInsightsSeeder - Cold-start bootstrapper.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { AWSPerfInsightsRoot } from "./entities.js";
import { AWSPerfInsightsContext } from "./context.js";

export const AWSPerfInsightsSeeder = Seeder.create({
  context: AWSPerfInsightsContext,

  async seed(env) {
    const rootRef = AWSPerfInsightsRoot.ref("root");

    await env.engine.store(EntityInput.create(rootRef, {
      region: env.ctx.api.region,
      dbResourceId: env.ctx.api.dbResourceId,
    }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("metrics"),
      Step.forRoot(rootRef).loadCollection("topSQL"),
      Step.forRoot(rootRef).loadCollection("topWaitEvents"),
      Step.forRoot(rootRef).loadCollection("analysisReports"),
    ]);
  },
});
