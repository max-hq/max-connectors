/**
 * DatadogMetricsSeeder - Cold-start bootstrapper.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { DatadogMetricsRoot, DatadogMetric } from "./entities.js";
import { DatadogMetricsContext } from "./context.js";

export const DatadogMetricsSeeder = Seeder.create({
  context: DatadogMetricsContext,

  async seed(env) {
    const rootRef = DatadogMetricsRoot.ref("root");

    await env.engine.store(EntityInput.create(rootRef, {
      site: env.ctx.api.site,
    }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("metrics"),
      Step.forAll(DatadogMetric).loadCollection("timeseries"),
    ]);
  },
});
