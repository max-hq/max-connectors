/**
 * LinearOrganization Resolver — Discovers teams, users, and projects from the org root.
 *
 * All loaders use raw GraphQL for exact field selection in a single HTTP request.
 * Collection loaders populate all available fields eagerly to avoid N+1 entity fetches.
 */

import {
  Loader,
  Resolver,
  EntityInput,
  Page,
  type LoaderName,
} from "@max/core";
import { LinearOrganization, LinearTeam, LinearUser, LinearProject } from "../entities.js";
import { LinearContext } from "../context.js";
import { GetOrganization, ListOrgTeams, ListOrgUsers, ListOrgProjects } from "../operations.js";

// ============================================================================
// Loaders
// ============================================================================

export const OrgBasicLoader = Loader.entity({
  name: "linear:org:basic",
  context: LinearContext,
  entity: LinearOrganization,

  async load(ref, env) {
    const { organization: org } = await env.ops.execute(GetOrganization, {});
    return EntityInput.create(ref, {
      name: org.name,
      urlKey: org.urlKey,
    });
  },
});

export const OrgTeamsLoader = Loader.collection({
  name: "linear:org:teams",
  context: LinearContext,
  entity: LinearOrganization,
  target: LinearTeam,

  async load(_ref, page, env) {
    const data = await env.ops.execute(ListOrgTeams, { cursor: page.cursor });
    const items = data.teams.nodes.map((t) =>
      EntityInput.create(LinearTeam.ref(t.id), {
        name: t.name,
        key: t.key,
        description: t.description ?? undefined,
      }),
    );
    return Page.from(items, data.teams.pageInfo.hasNextPage, data.teams.pageInfo.endCursor);
  },
});

export const OrgUsersLoader = Loader.collection({
  name: "linear:org:users",
  context: LinearContext,
  entity: LinearOrganization,
  target: LinearUser,

  async load(_ref, page, env) {
    const data = await env.ops.execute(ListOrgUsers, { cursor: page.cursor });
    const items = data.users.nodes.map((u) =>
      EntityInput.create(LinearUser.ref(u.id), {
        name: u.name,
        email: u.email,
        displayName: u.displayName,
        active: u.active,
        admin: u.admin,
      }),
    );
    return Page.from(items, data.users.pageInfo.hasNextPage, data.users.pageInfo.endCursor);
  },
});

export const OrgProjectsLoader = Loader.collection({
  name: "linear:org:projects",
  context: LinearContext,
  entity: LinearOrganization,
  target: LinearProject,

  async load(_ref, page, env) {
    const data = await env.ops.execute(ListOrgProjects, { cursor: page.cursor });
    const items = data.projects.nodes.map((p) =>
      EntityInput.create(LinearProject.ref(p.id), {
        name: p.name,
        description: p.description ?? undefined,
        state: p.state,
        progress: p.progress,
        startDate: p.startDate ?? undefined,
        targetDate: p.targetDate ?? undefined,
      }),
    );
    return Page.from(items, data.projects.pageInfo.hasNextPage, data.projects.pageInfo.endCursor);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const LinearOrganizationResolver = Resolver.for(LinearOrganization, {
  name: OrgBasicLoader.field("name"),
  urlKey: OrgBasicLoader.field("urlKey"),
  teams: OrgTeamsLoader.field(),
  users: OrgUsersLoader.field(),
  projects: OrgProjectsLoader.field(),
});
