/**
 * DatadogMetricsSeeder - Cold-start bootstrapper.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { DatadogMetricsRoot } from "./entities.js";
import { DatadogMetricsContext } from "./context.js";

export const DatadogMetricsSeeder = Seeder.create({
  context: DatadogMetricsContext,

  async seed(ctx, engine) {
    const rootRef = DatadogMetricsRoot.ref("root");

    await engine.store(EntityInput.create(rootRef, {
      site: ctx.api.site,
    }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("metrics"),
      Step.forRoot(rootRef).loadCollection("timeseries"),
    ]);
  },
});
