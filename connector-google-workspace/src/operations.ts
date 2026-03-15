/**
 * Google Workspace operations — typed API call tokens.
 *
 * Each operation wraps a single Admin Directory API call, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { GoogleWorkspaceContext } from "./context.js";

// ============================================================================
// Operations
// ============================================================================

export const ListUsers = Operation.define({
  name: "google-workspace:user:list",
  context: GoogleWorkspaceContext,
  async handle(
    input: { pageToken?: string },
    env,
  ): Promise<{ users: unknown[]; nextPageToken?: string }> {
    return env.ctx.api.listUsers(input.pageToken);
  },
});

export const ListGroups = Operation.define({
  name: "google-workspace:group:list",
  context: GoogleWorkspaceContext,
  async handle(
    input: { pageToken?: string },
    env,
  ): Promise<{ groups: unknown[]; nextPageToken?: string }> {
    return env.ctx.api.listGroups(input.pageToken);
  },
});

export const ListOrgUnits = Operation.define({
  name: "google-workspace:org-unit:list",
  context: GoogleWorkspaceContext,
  async handle(
    _input: {},
    env,
  ): Promise<{ organizationUnits: unknown[] }> {
    return env.ctx.api.listOrgUnits();
  },
});

export const GetUser = Operation.define({
  name: "google-workspace:user:get",
  context: GoogleWorkspaceContext,
  async handle(
    input: { userKey: string },
    env,
  ): Promise<Record<string, unknown>> {
    return env.ctx.api.getUser(input.userKey);
  },
});

export const GetGroup = Operation.define({
  name: "google-workspace:group:get",
  context: GoogleWorkspaceContext,
  async handle(
    input: { groupKey: string },
    env,
  ): Promise<Record<string, unknown>> {
    return env.ctx.api.getGroup(input.groupKey);
  },
});

export const ListGroupMembers = Operation.define({
  name: "google-workspace:group-member:list",
  context: GoogleWorkspaceContext,
  async handle(
    input: { groupKey: string; pageToken?: string },
    env,
  ): Promise<{ members: unknown[]; nextPageToken?: string }> {
    return env.ctx.api.listGroupMembers(input.groupKey, input.pageToken);
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const GoogleWorkspaceOperations = [
  ListUsers,
  ListGroups,
  ListOrgUnits,
  GetUser,
  GetGroup,
  ListGroupMembers,
] as const;
