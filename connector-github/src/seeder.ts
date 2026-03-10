/**
 * GitHubSeeder — Cold-start bootstrapper for the GitHub connector.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { GitHubRoot } from "./entities.js";
import { GitHubContext } from "./context.js";

export const GitHubSeeder = Seeder.create({
  context: GitHubContext,

  async seed(ctx, engine) {
    const user = await ctx.api.getAuthenticatedUser();
    const login = (user.login as string) ?? "";

    const rootRef = GitHubRoot.ref("root");

    await engine.store(EntityInput.create(rootRef, { login }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("repositories"),
      Step.forRoot(rootRef).loadCollection("pullRequests"),
      Step.forRoot(rootRef).loadCollection("commits"),
      Step.forRoot(rootRef).loadCollection("workflowRuns"),
      Step.forRoot(rootRef).loadCollection("issues"),
      Step.forRoot(rootRef).loadCollection("reviews"),
      Step.forRoot(rootRef).loadCollection("users"),
    ]);
  },
});
