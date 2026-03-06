/**
 * DatadogIncidentsSeeder - Cold-start bootstrapper.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { DatadogIncidentsRoot } from "./entities.js";
import { DatadogIncidentsContext } from "./context.js";

export const DatadogIncidentsSeeder = Seeder.create({
  context: DatadogIncidentsContext,

  async seed(ctx, engine) {
    const rootRef = DatadogIncidentsRoot.ref("root");

    await engine.store(EntityInput.create(rootRef, {
      site: ctx.api.site,
    }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("incidents"),
      Step.forRoot(rootRef).loadCollection("todos"),
    ]);
  },
});
