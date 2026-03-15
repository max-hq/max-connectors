/**
 * GitHubRepository Resolver - Loads repo metadata, issues, and issue authors.
 *
 * Uses a paginated Source for the issues GraphQL query, with two co-derivations:
 * one extracts GitHubIssue entities, the other extracts GitHubUser entities from
 * the inline author data. Both entity types are populated in a single pagination
 * pass - no separate user fetches needed.
 *
 * RepoBasicLoader (entity loader) handles repo metadata independently.
 */

import {
  Resolver,
  EntityInput,
  Loader,
  SourcePage,
  type LoaderName,
  type SourceName,
} from "@max/core";
import { GitHubRepository, GitHubIssue, GitHubUser } from "../entities.js";
import { GitHubContext } from "../context.js";
import { GetRepo, ListRepoIssues } from "../operations.js";

// ============================================================================
// Repo basic loader (entity)
// ============================================================================

export const RepoBasicLoader = Loader.entity({
  name: "github:repo:basic",
  context: GitHubContext,
  entity: GitHubRepository,
  strategy: "autoload",

  async load(ref, env) {
    const data = await env.ops.execute(GetRepo, {
      owner: env.ctx.api.owner,
      repo: env.ctx.api.repo,
    });
    return EntityInput.create(ref, {
      name: data.repository.name,
      description: data.repository.description ?? undefined,
      url: data.repository.url,
    });
  },
});

// ============================================================================
// Issues page source + co-derivations
// ============================================================================

const IssuesPageSource = Loader.paginatedSource({
  name: "github:repo:issues-page" as SourceName,
  context: GitHubContext,
  parent: GitHubRepository,

  async fetch(_ref, page, env) {
    const data = await env.ops.execute(ListRepoIssues, {
      owner: env.ctx.api.owner,
      repo: env.ctx.api.repo,
      cursor: page.cursor,
    });
    const pageInfo = data.repository.issues.pageInfo;
    return SourcePage.from(data, pageInfo.hasNextPage, pageInfo.endCursor);
  },
});

/** Primary derivation: extract issues from each page. */
export const RepoIssuesLoader = Loader.deriveEntities(IssuesPageSource, {
  name: "github:repo:issues",
  target: GitHubIssue,

  extract(data) {
    return data.repository.issues.nodes.map((i) =>
      EntityInput.create(GitHubIssue.ref(i.id), {
        number: i.number,
        title: i.title,
        body: i.body ?? undefined,
        state: i.state.toLowerCase(),
        labels: i.labels.nodes.map((l) => l.name).join(", "),
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        author: i.author ? GitHubUser.ref(i.author.login) : undefined,
      }),
    );
  },
});

/** Co-derivation: extract unique users from inline author data. */
export const IssueAuthorsLoader = Loader.deriveEntities(IssuesPageSource, {
  name: "github:repo:issue-authors",
  target: GitHubUser,

  extract(data) {
    const seen = new Set<string>();
    const users: EntityInput<typeof GitHubUser>[] = [];
    for (const issue of data.repository.issues.nodes) {
      if (issue.author && !seen.has(issue.author.login)) {
        seen.add(issue.author.login);
        users.push(
          EntityInput.create(GitHubUser.ref(issue.author.login), {
            login: issue.author.login,
            avatarUrl: issue.author.avatarUrl,
            url: issue.author.url,
          }),
        );
      }
    }
    return users;
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GitHubRepositoryResolver = Resolver.for(GitHubRepository, {
  name: RepoBasicLoader.field("name"),
  description: RepoBasicLoader.field("description"),
  url: RepoBasicLoader.field("url"),
  issues: RepoIssuesLoader.field(),
  issueAuthors: IssueAuthorsLoader.field(),
});
