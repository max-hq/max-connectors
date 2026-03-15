/**
 * GitHub operations — typed API call tokens.
 *
 * Each operation wraps a single GitHub GraphQL call, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { GitHubContext } from "./context.js";

// ============================================================================
// GraphQL response types
// ============================================================================

export interface RepoResponse {
  repository: {
    id: string;
    name: string;
    description: string | null;
    url: string;
  };
}

export interface IssuesPageData {
  repository: {
    issues: {
      nodes: Array<{
        id: string;
        number: number;
        title: string;
        body: string | null;
        state: string;
        createdAt: string;
        updatedAt: string;
        labels: { nodes: Array<{ name: string }> };
        author: { login: string; avatarUrl: string; url: string } | null;
      }>;
      pageInfo: { hasNextPage: boolean; endCursor: string };
    };
  };
}

export interface IssueNodeResponse {
  node: {
    number: number;
    title: string;
    body: string | null;
    state: string;
    createdAt: string;
    updatedAt: string;
    labels: { nodes: Array<{ name: string }> };
    author: { login: string; avatarUrl: string; url: string } | null;
  } | null;
}

export interface UserResponse {
  user: {
    login: string;
    avatarUrl: string;
    url: string;
  };
}

// ============================================================================
// Operations
// ============================================================================

export const GetRepo = Operation.define({
  name: "github:repo:get",
  context: GitHubContext,
  async handle(
    input: { owner: string; repo: string },
    env,
  ): Promise<RepoResponse> {
    return env.ctx.api.graphql<RepoResponse>(
      `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id name description url
        }
      }`,
      { owner: input.owner, repo: input.repo },
    );
  },
});

export const ListRepoIssues = Operation.define({
  name: "github:repo:issues",
  context: GitHubContext,
  async handle(
    input: { owner: string; repo: string; cursor?: string },
    env,
  ): Promise<IssuesPageData> {
    return env.ctx.api.graphql<IssuesPageData>(
      `query($owner: String!, $repo: String!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          issues(first: 100, after: $cursor, orderBy: {field: CREATED_AT, direction: ASC}) {
            nodes {
              id number title body state createdAt updatedAt
              labels(first: 20) { nodes { name } }
              author { login avatarUrl url }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { owner: input.owner, repo: input.repo, cursor: input.cursor },
    );
  },
});

export const GetIssue = Operation.define({
  name: "github:issue:get",
  context: GitHubContext,
  async handle(input: { id: string }, env): Promise<IssueNodeResponse> {
    return env.ctx.api.graphql<IssueNodeResponse>(
      `query($id: ID!) {
        node(id: $id) {
          ... on Issue {
            number title body state createdAt updatedAt
            labels(first: 20) { nodes { name } }
            author { login avatarUrl url }
          }
        }
      }`,
      { id: input.id },
    );
  },
});

export const GetUser = Operation.define({
  name: "github:user:get",
  context: GitHubContext,
  async handle(input: { login: string }, env): Promise<UserResponse> {
    return env.ctx.api.graphql<UserResponse>(
      `query($login: String!) {
        user(login: $login) {
          login avatarUrl url
        }
      }`,
      { login: input.login },
    );
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const GitHubOperations = [
  GetRepo,
  ListRepoIssues,
  GetIssue,
  GetUser,
] as const;
