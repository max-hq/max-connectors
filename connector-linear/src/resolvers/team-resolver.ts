/**
 * LinearTeam Resolver — Loads team details, issues, and members.
 *
 * All loaders use raw GraphQL for exact field selection. Issue state names
 * and assignee IDs are resolved inline in the query (e.g. `state { name }`,
 * `assignee { id }`), eliminating N+1 queries entirely.
 */

import {
  Loader,
  Resolver,
  EntityInput,
  Page,
  type LoaderName,
} from "@max/core";
import { LinearTeam, LinearIssue, LinearUser, LinearProject } from "../entities.js";
import { LinearContext } from "../context.js";
import { GetTeam, ListTeamIssues, ListTeamMembers } from "../operations.js";

// ============================================================================
// Loaders
// ============================================================================

export const TeamBasicLoader = Loader.entity({
  name: "linear:team:basic",
  context: LinearContext,
  entity: LinearTeam,

  async load(ref, env) {
    const data = await env.ops.execute(GetTeam, { id: ref.id });
    return EntityInput.create(ref, {
      name: data.team.name,
      key: data.team.key,
      description: data.team.description ?? undefined,
    });
  },
});

export const TeamIssuesLoader = Loader.collection({
  name: "linear:team:issues",
  context: LinearContext,
  entity: LinearTeam,
  target: LinearIssue,

  async load(ref, page, env) {
    const data = await env.ops.execute(ListTeamIssues, {
      teamId: ref.id,
      cursor: page.cursor,
    });
    const result = data.team.issues;
    const items = result.nodes.map((i) =>
      EntityInput.create(LinearIssue.ref(i.id), {
        identifier: i.identifier,
        title: i.title,
        description: i.description ?? undefined,
        priority: i.priority,
        state: i.state?.name ?? undefined,
        assignee: i.assignee ? LinearUser.ref(i.assignee.id) : undefined,
        project: i.project ? LinearProject.ref(i.project.id) : undefined,
      }),
    );
    return Page.from(items, result.pageInfo.hasNextPage, result.pageInfo.endCursor);
  },
});

export const TeamMembersLoader = Loader.collection({
  name: "linear:team:members",
  context: LinearContext,
  entity: LinearTeam,
  target: LinearUser,

  async load(ref, page, env) {
    const data = await env.ops.execute(ListTeamMembers, {
      teamId: ref.id,
      cursor: page.cursor,
    });
    const result = data.team.members;
    const items = result.nodes.map((u) =>
      EntityInput.create(LinearUser.ref(u.id), {
        name: u.name,
        email: u.email,
        displayName: u.displayName,
        active: u.active,
        admin: u.admin,
      }),
    );
    return Page.from(items, result.pageInfo.hasNextPage, result.pageInfo.endCursor);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const LinearTeamResolver = Resolver.for(LinearTeam, {
  name: TeamBasicLoader.field("name"),
  key: TeamBasicLoader.field("key"),
  description: TeamBasicLoader.field("description"),
  issues: TeamIssuesLoader.field(),
  members: TeamMembersLoader.field(),
});
