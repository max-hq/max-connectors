/**
 * GitHubIssue Resolver — Autoload fallback for issues.
 *
 * In practice, fields are populated eagerly by IssuesLoader during
 * collection loading. This entity loader serves as an autoload fallback.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { GitHubIssue } from "../entities.js";
import { GitHubContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const IssueBasicLoader = Loader.entity({
  name: "github:issue:basic",
  context: GitHubContext,
  entity: GitHubIssue,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GitHubIssueResolver = Resolver.for(GitHubIssue, {
  repo: IssueBasicLoader.field("repo"),
  number: IssueBasicLoader.field("number"),
  title: IssueBasicLoader.field("title"),
  body: IssueBasicLoader.field("body"),
  state: IssueBasicLoader.field("state"),
  labels: IssueBasicLoader.field("labels"),
  author: IssueBasicLoader.field("author"),
  createdAt: IssueBasicLoader.field("createdAt"),
  updatedAt: IssueBasicLoader.field("updatedAt"),
});
