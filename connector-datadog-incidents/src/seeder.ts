/**
 * DatadogIncidentsSeeder - Cold-start bootstrapper.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { DatadogIncidentsRoot, DatadogIncident } from "./entities.js";
import { DatadogIncidentsContext } from "./context.js";

export const DatadogIncidentsSeeder = Seeder.create({
  context: DatadogIncidentsContext,

  async seed(env) {
    const rootRef = DatadogIncidentsRoot.ref("root");

    await env.engine.store(EntityInput.create(rootRef, {
      site: env.ctx.api.site,
    }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("incidents"),
      Step.forAll(DatadogIncident).loadCollection("todos"),
    ]);
  },
});
