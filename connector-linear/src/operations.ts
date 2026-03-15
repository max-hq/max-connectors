/**
 * Linear operations — typed API call tokens.
 *
 * Each operation wraps a single Linear GraphQL call, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { LinearContext } from "./context.js";

// ============================================================================
// GraphQL response types
// ============================================================================

export interface OrgResponse {
  organization: {
    name: string;
    urlKey: string;
  };
}

export interface TeamsResponse {
  teams: {
    nodes: Array<{
      id: string;
      name: string;
      key: string;
      description: string | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export interface UsersResponse {
  users: {
    nodes: Array<{
      id: string;
      name: string;
      email: string;
      displayName: string;
      active: boolean;
      admin: boolean;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export interface ProjectsResponse {
  projects: {
    nodes: Array<{
      id: string;
      name: string;
      description: string | null;
      state: string;
      progress: number;
      startDate: string | null;
      targetDate: string | null;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string };
  };
}

export interface TeamResponse {
  team: {
    name: string;
    key: string;
    description: string | null;
  };
}

export interface TeamIssuesResponse {
  team: {
    issues: {
      nodes: Array<{
        id: string;
        identifier: string;
        title: string;
        description: string | null;
        priority: number;
        state: { name: string } | null;
        assignee: { id: string } | null;
        project: { id: string } | null;
      }>;
      pageInfo: { hasNextPage: boolean; endCursor: string };
    };
  };
}

export interface TeamMembersResponse {
  team: {
    members: {
      nodes: Array<{
        id: string;
        name: string;
        email: string;
        displayName: string;
        active: boolean;
        admin: boolean;
      }>;
      pageInfo: { hasNextPage: boolean; endCursor: string };
    };
  };
}

export interface UserResponse {
  user: {
    name: string;
    email: string;
    displayName: string;
    active: boolean;
    admin: boolean;
  };
}

export interface ProjectResponse {
  project: {
    name: string;
    description: string | null;
    state: string;
    progress: number;
    startDate: string | null;
    targetDate: string | null;
  };
}

export interface ProjectIssuesResponse {
  project: {
    issues: {
      nodes: Array<{
        id: string;
        identifier: string;
        title: string;
        description: string | null;
        priority: number;
        state: { name: string } | null;
        assignee: { id: string } | null;
      }>;
      pageInfo: { hasNextPage: boolean; endCursor: string };
    };
  };
}

export interface IssueResponse {
  issue: {
    identifier: string;
    title: string;
    description: string | null;
    priority: number;
    state: { name: string } | null;
    assignee: { id: string } | null;
    project: { id: string } | null;
  };
}

// ============================================================================
// Operations
// ============================================================================

export const GetOrganization = Operation.define({
  name: "linear:org:get",
  context: LinearContext,
  async handle(_input: {}, env): Promise<OrgResponse> {
    return env.ctx.api.graphql<OrgResponse>(
      `{ organization { name urlKey } }`,
    );
  },
});

export const ListOrgTeams = Operation.define({
  name: "linear:org:teams",
  context: LinearContext,
  async handle(input: { cursor?: string }, env): Promise<TeamsResponse> {
    return env.ctx.api.graphql<TeamsResponse>(
      `query($cursor: String) {
        teams(first: 250, after: $cursor) {
          nodes { id name key description }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor: input.cursor },
    );
  },
});

export const ListOrgUsers = Operation.define({
  name: "linear:org:users",
  context: LinearContext,
  async handle(input: { cursor?: string }, env): Promise<UsersResponse> {
    return env.ctx.api.graphql<UsersResponse>(
      `query($cursor: String) {
        users(first: 250, after: $cursor, includeArchived: true, includeDisabled: true) {
          nodes { id name email displayName active admin }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor: input.cursor },
    );
  },
});

export const ListOrgProjects = Operation.define({
  name: "linear:org:projects",
  context: LinearContext,
  async handle(input: { cursor?: string }, env): Promise<ProjectsResponse> {
    return env.ctx.api.graphql<ProjectsResponse>(
      `query($cursor: String) {
        projects(first: 250, after: $cursor) {
          nodes { id name description state progress startDate targetDate }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor: input.cursor },
    );
  },
});

export const GetTeam = Operation.define({
  name: "linear:team:get",
  context: LinearContext,
  async handle(input: { id: string }, env): Promise<TeamResponse> {
    return env.ctx.api.graphql<TeamResponse>(
      `query($id: String!) {
        team(id: $id) { name key description }
      }`,
      { id: input.id },
    );
  },
});

export const ListTeamIssues = Operation.define({
  name: "linear:team:issues",
  context: LinearContext,
  async handle(
    input: { teamId: string; cursor?: string },
    env,
  ): Promise<TeamIssuesResponse> {
    return env.ctx.api.graphql<TeamIssuesResponse>(
      `query($teamId: String!, $cursor: String) {
        team(id: $teamId) {
          issues(first: 250, after: $cursor) {
            nodes {
              id identifier title description priority
              state { name }
              assignee { id }
              project { id }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { teamId: input.teamId, cursor: input.cursor },
    );
  },
});

export const ListTeamMembers = Operation.define({
  name: "linear:team:members",
  context: LinearContext,
  async handle(
    input: { teamId: string; cursor?: string },
    env,
  ): Promise<TeamMembersResponse> {
    return env.ctx.api.graphql<TeamMembersResponse>(
      `query($teamId: String!, $cursor: String) {
        team(id: $teamId) {
          members(first: 250, after: $cursor) {
            nodes { id name email displayName active admin }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { teamId: input.teamId, cursor: input.cursor },
    );
  },
});

export const GetUser = Operation.define({
  name: "linear:user:get",
  context: LinearContext,
  async handle(input: { id: string }, env): Promise<UserResponse> {
    return env.ctx.api.graphql<UserResponse>(
      `query($id: String!) {
        user(id: $id) { name email displayName active admin }
      }`,
      { id: input.id },
    );
  },
});

export const GetProject = Operation.define({
  name: "linear:project:get",
  context: LinearContext,
  async handle(input: { id: string }, env): Promise<ProjectResponse> {
    return env.ctx.api.graphql<ProjectResponse>(
      `query($id: String!) {
        project(id: $id) { name description state progress startDate targetDate }
      }`,
      { id: input.id },
    );
  },
});

export const ListProjectIssues = Operation.define({
  name: "linear:project:issues",
  context: LinearContext,
  async handle(
    input: { projectId: string; cursor?: string },
    env,
  ): Promise<ProjectIssuesResponse> {
    return env.ctx.api.graphql<ProjectIssuesResponse>(
      `query($projectId: String!, $cursor: String) {
        project(id: $projectId) {
          issues(first: 250, after: $cursor) {
            nodes {
              id identifier title description priority
              state { name }
              assignee { id }
            }
            pageInfo { hasNextPage endCursor }
          }
        }
      }`,
      { projectId: input.projectId, cursor: input.cursor },
    );
  },
});

export const GetIssue = Operation.define({
  name: "linear:issue:get",
  context: LinearContext,
  async handle(input: { id: string }, env): Promise<IssueResponse> {
    return env.ctx.api.graphql<IssueResponse>(
      `query($id: String!) {
        issue(id: $id) {
          identifier title description priority
          state { name }
          assignee { id }
          project { id }
        }
      }`,
      { id: input.id },
    );
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const LinearOperations = [
  GetOrganization,
  ListOrgTeams,
  ListOrgUsers,
  ListOrgProjects,
  GetTeam,
  ListTeamIssues,
  ListTeamMembers,
  GetUser,
  GetProject,
  ListProjectIssues,
  GetIssue,
] as const;
