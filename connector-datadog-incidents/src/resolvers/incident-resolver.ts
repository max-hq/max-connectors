/**
 * DatadogIncident Resolver — Scalar fields + per-incident todos collection.
 */

import { Loader, Resolver, EntityInput, Page } from "@max/core";
import { DatadogIncident, DatadogIncidentTodo } from "../entities.js";
import { DatadogIncidentsContext } from "../context.js";
import { ListIncidentTodos } from "../operations.js";

// ============================================================================
// Helpers
// ============================================================================

function formatTimestamp(value: Date | string | undefined | null): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

// ============================================================================
// Basic loader (autoload fallback — fields populated eagerly by IncidentsLoader)
// ============================================================================

export const IncidentBasicLoader = Loader.entity({
  name: "datadog-incidents:incident:basic",
  context: DatadogIncidentsContext,
  entity: DatadogIncident,
  strategy: "autoload",

  async load(ref, _env) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Todos collection loader (per-incident)
// ============================================================================

export const IncidentTodosLoader = Loader.collection({
  name: "datadog-incidents:incident:todos",
  context: DatadogIncidentsContext,
  entity: DatadogIncident,
  target: DatadogIncidentTodo,

  async load(ref, _page, env) {
    const result = await env.ops.execute(ListIncidentTodos, {
      incidentId: ref.id,
    });

    const items = result.data.map((todo) => {
      const attrs = todo.attributes;

      return EntityInput.create(DatadogIncidentTodo.ref(todo.id), {
        todoId: todo.id,
        incident: DatadogIncident.ref(ref.id),
        content: attrs.content ?? "",
        completed: attrs.completed ?? "",
        dueDate: attrs.dueDate ?? "",
        created: formatTimestamp(attrs.created),
        modified: formatTimestamp(attrs.modified),
      });
    });

    return Page.from(items, false, undefined);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogIncidentResolver = Resolver.for(DatadogIncident, {
  incidentId: IncidentBasicLoader.field("incidentId"),
  publicId: IncidentBasicLoader.field("publicId"),
  title: IncidentBasicLoader.field("title"),
  severity: IncidentBasicLoader.field("severity"),
  state: IncidentBasicLoader.field("state"),
  customerImpacted: IncidentBasicLoader.field("customerImpacted"),
  customerImpactScope: IncidentBasicLoader.field("customerImpactScope"),
  customerImpactDuration: IncidentBasicLoader.field("customerImpactDuration"),
  created: IncidentBasicLoader.field("created"),
  modified: IncidentBasicLoader.field("modified"),
  detected: IncidentBasicLoader.field("detected"),
  resolved: IncidentBasicLoader.field("resolved"),
  timeToDetect: IncidentBasicLoader.field("timeToDetect"),
  timeToRepair: IncidentBasicLoader.field("timeToRepair"),
  timeToResolve: IncidentBasicLoader.field("timeToResolve"),
  visibility: IncidentBasicLoader.field("visibility"),
  todos: IncidentTodosLoader.field(),
});
