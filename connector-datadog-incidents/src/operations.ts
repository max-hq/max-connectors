/**
 * Datadog Incidents operations — typed API call tokens.
 *
 * Each operation wraps a single Datadog API call, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { DatadogIncidentsContext } from "./context.js";
import type { ListIncidentsResult, ListTodosResult } from "./datadog-client.js";

// ============================================================================
// Operations
// ============================================================================

export const ListIncidents = Operation.define({
  name: "datadog-incidents:incident:list",
  context: DatadogIncidentsContext,
  async handle(
    input: { pageSize: number; pageOffset: number },
    env,
  ): Promise<ListIncidentsResult> {
    return env.ctx.api.listIncidents(input.pageSize, input.pageOffset);
  },
});

export const ListIncidentTodos = Operation.define({
  name: "datadog-incidents:todo:list",
  context: DatadogIncidentsContext,
  async handle(
    input: { incidentId: string },
    env,
  ): Promise<ListTodosResult> {
    return env.ctx.api.listIncidentTodos(input.incidentId);
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const DatadogIncidentsOperations = [
  ListIncidents,
  ListIncidentTodos,
] as const;
