/**
 * GitHubRepository Resolver — Autoload fallback for repositories.
 *
 * In practice, fields are populated eagerly by RepositoriesLoader during
 * collection loading. This entity loader serves as an autoload fallback.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { GitHubRepository } from "../entities.js";
import { GitHubContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const RepoBasicLoader = Loader.entity({
  name: "github:repo:basic",
  context: GitHubContext,
  entity: GitHubRepository,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GitHubRepositoryResolver = Resolver.for(GitHubRepository, {
  fullName: RepoBasicLoader.field("fullName"),
  name: RepoBasicLoader.field("name"),
  description: RepoBasicLoader.field("description"),
  url: RepoBasicLoader.field("url"),
  language: RepoBasicLoader.field("language"),
  stars: RepoBasicLoader.field("stars"),
  forks: RepoBasicLoader.field("forks"),
  openIssuesCount: RepoBasicLoader.field("openIssuesCount"),
  isPrivate: RepoBasicLoader.field("isPrivate"),
  isArchived: RepoBasicLoader.field("isArchived"),
  defaultBranch: RepoBasicLoader.field("defaultBranch"),
  pushedAt: RepoBasicLoader.field("pushedAt"),
  createdAt: RepoBasicLoader.field("createdAt"),
  updatedAt: RepoBasicLoader.field("updatedAt"),
  topics: RepoBasicLoader.field("topics"),
});
