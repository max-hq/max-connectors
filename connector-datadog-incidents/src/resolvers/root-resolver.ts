/**
 * DatadogIncidentsRoot Resolver — Loads root metadata and all collections.
 */

import { Resolver, EntityInput, Loader, Page } from "@max/core";
import {
  DatadogIncidentsRoot,
  DatadogIncident,
  DatadogIncidentTodo,
} from "../entities.js";
import { DatadogIncidentsContext } from "../context.js";
import { stableId } from "../id-utils.js";
import type { DatadogClient, IncidentData } from "../datadog-client.js";

// ============================================================================
// Helpers
// ============================================================================

function formatTimestamp(value: Date | string | undefined | null): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** Fetch all incidents by paginating through listIncidents. */
async function fetchAllIncidents(api: DatadogClient): Promise<IncidentData[]> {
  const PAGE_SIZE = 100;
  const allIncidents: IncidentData[] = [];
  let pageOffset = 0;

  do {
    const result = await api.listIncidents(PAGE_SIZE, pageOffset);
    allIncidents.push(...result.data);

    if (!result.hasMore) break;
    pageOffset += PAGE_SIZE;
  } while (true);

  return allIncidents;
}

// ============================================================================
// Root basic loader (entity — autoload fallback for scalar fields)
// ============================================================================

export const RootBasicLoader = Loader.entity({
  name: "datadog-incidents:root:basic",
  context: DatadogIncidentsContext,
  entity: DatadogIncidentsRoot,
  strategy: "autoload",

  async load(ref, ctx) {
    return EntityInput.create(ref, {
      site: ctx.api.site,
    });
  },
});

// ============================================================================
// Incidents collection loader (paginated)
// ============================================================================

export const IncidentsLoader = Loader.collection({
  name: "datadog-incidents:root:incidents",
  context: DatadogIncidentsContext,
  entity: DatadogIncidentsRoot,
  target: DatadogIncident,

  async load(_ref, _page, ctx) {
    try {
      const allIncidents = await fetchAllIncidents(ctx.api);

      const items = allIncidents.map((incident) => {
        const attrs = incident.attributes;
        const incidentId = incident.id;
        const id = stableId("incident", incidentId);

        return EntityInput.create(DatadogIncident.ref(id), {
          incidentId,
          publicId: attrs.publicId ?? 0,
          title: attrs.title ?? "",
          severity: attrs.severity ?? "UNKNOWN",
          state: attrs.state ?? "",
          customerImpacted: String(attrs.customerImpacted ?? false),
          customerImpactScope: attrs.customerImpactScope ?? "",
          customerImpactDuration: attrs.customerImpactDuration ?? 0,
          created: formatTimestamp(attrs.created),
          modified: formatTimestamp(attrs.modified),
          detected: formatTimestamp(attrs.detected),
          resolved: formatTimestamp(attrs.resolved),
          timeToDetect: attrs.timeToDetect ?? 0,
          timeToRepair: attrs.timeToRepair ?? 0,
          timeToResolve: attrs.timeToResolve ?? 0,
          visibility: attrs.visibility ?? "",
        });
      });

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Todos collection loader (fetch all incidents, then todos for each)
// ============================================================================

export const TodosLoader = Loader.collection({
  name: "datadog-incidents:root:todos",
  context: DatadogIncidentsContext,
  entity: DatadogIncidentsRoot,
  target: DatadogIncidentTodo,

  async load(_ref, _page, ctx) {
    try {
      const allIncidents = await fetchAllIncidents(ctx.api);

      const items: EntityInput<typeof DatadogIncidentTodo>[] = [];

      for (const incident of allIncidents) {
        try {
          const result = await ctx.api.listIncidentTodos(incident.id);

          for (const todo of result.data) {
            const todoId = todo.id;
            const attrs = todo.attributes;
            const id = stableId("todo", todoId);

            items.push(
              EntityInput.create(DatadogIncidentTodo.ref(id), {
                todoId,
                incidentId: attrs.incidentId ?? incident.id,
                content: attrs.content ?? "",
                completed: attrs.completed ?? "",
                dueDate: attrs.dueDate ?? "",
                created: formatTimestamp(attrs.created),
                modified: formatTimestamp(attrs.modified),
              }),
            );
          }
        } catch {
          // Skip todos for incidents that fail — graceful degradation
        }
      }

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogIncidentsRootResolver = Resolver.for(DatadogIncidentsRoot, {
  site: RootBasicLoader.field("site"),
  incidents: IncidentsLoader.field(),
  todos: TodosLoader.field(),
});
