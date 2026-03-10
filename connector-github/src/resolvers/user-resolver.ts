/**
 * GitHubUser Resolver — Autoload fallback for users.
 *
 * In practice, fields are populated eagerly by UsersLoader during
 * collection loading. This entity loader serves as an autoload fallback.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { GitHubUser } from "../entities.js";
import { GitHubContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const UserBasicLoader = Loader.entity({
  name: "github:user:basic",
  context: GitHubContext,
  entity: GitHubUser,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GitHubUserResolver = Resolver.for(GitHubUser, {
  login: UserBasicLoader.field("login"),
  name: UserBasicLoader.field("name"),
  email: UserBasicLoader.field("email"),
  avatarUrl: UserBasicLoader.field("avatarUrl"),
  url: UserBasicLoader.field("url"),
  company: UserBasicLoader.field("company"),
  bio: UserBasicLoader.field("bio"),
  location: UserBasicLoader.field("location"),
  publicRepos: UserBasicLoader.field("publicRepos"),
  followers: UserBasicLoader.field("followers"),
});
