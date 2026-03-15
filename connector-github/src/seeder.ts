/**
 * GitHubSeeder - Cold-start bootstrapper for the GitHub connector.
 *
 * Creates the root repository entity via GraphQL and returns a plan to
 * discover issues.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { GitHubRepository } from "./entities.js";
import { GitHubContext } from "./context.js";

interface SeedRepoResponse {
  repository: {
    id: string;
    name: string;
    description: string | null;
    url: string;
  };
}

export const GitHubSeeder = Seeder.create({
  context: GitHubContext,

  async seed(env) {
    const data = await env.ctx.api.graphql<SeedRepoResponse>(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id name description url
        }
      }`,
      { owner: env.ctx.api.owner, repo: env.ctx.api.repo },
    );

    const repo = data.repository;
    const repoRef = GitHubRepository.ref(repo.id);

    await env.engine.store(EntityInput.create(repoRef, {
      name: repo.name,
      description: repo.description ?? undefined,
      url: repo.url,
    }));

    return SyncPlan.create([
      Step.forRoot(repoRef).loadCollection("issues"),
    ]);
  },
});
