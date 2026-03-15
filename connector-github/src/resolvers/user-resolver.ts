/**
 * GitHubUser Resolver - Loads user profile data via GraphQL.
 *
 * User entities are keyed by login (e.g. GitHubUser.ref("octocat")).
 * This autoload loader fetches full profile data from the GitHub GraphQL API
 * when user fields beyond the ref ID are queried.
 */

import {
  Loader,
  Resolver,
  EntityInput,
  type LoaderName,
} from "@max/core";
import { GitHubUser } from "../entities.js";
import { GitHubContext } from "../context.js";
import { GetUser } from "../operations.js";

// ============================================================================
// Loaders
// ============================================================================

export const UserBasicLoader = Loader.entity({
  name: "github:user:basic",
  context: GitHubContext,
  entity: GitHubUser,
  strategy: "autoload",

  async load(ref, env) {
    const data = await env.ops.execute(GetUser, { login: ref.id });
    return EntityInput.create(ref, {
      login: data.user.login,
      avatarUrl: data.user.avatarUrl,
      url: data.user.url,
    });
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GitHubUserResolver = Resolver.for(GitHubUser, {
  login: UserBasicLoader.field("login"),
  avatarUrl: UserBasicLoader.field("avatarUrl"),
  url: UserBasicLoader.field("url"),
});
