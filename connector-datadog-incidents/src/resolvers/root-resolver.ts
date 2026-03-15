/**
 * DatadogIncidentsRoot Resolver — Root metadata and paginated incidents.
 */

import { Resolver, EntityInput, Loader, Page } from "@max/core";
import { DatadogIncidentsRoot, DatadogIncident } from "../entities.js";
import { DatadogIncidentsContext } from "../context.js";
import { ListIncidents } from "../operations.js";

// ============================================================================
// Helpers
// ============================================================================

function formatTimestamp(value: Date | string | undefined | null): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

// ============================================================================
// Root basic loader (entity — autoload fallback for scalar fields)
// ============================================================================

export const RootBasicLoader = Loader.entity({
  name: "datadog-incidents:root:basic",
  context: DatadogIncidentsContext,
  entity: DatadogIncidentsRoot,
  strategy: "autoload",

  async load(ref, env) {
    return EntityInput.create(ref, {
      site: env.ctx.api.site,
    });
  },
});

// ============================================================================
// Incidents collection loader (offset-paginated)
// ============================================================================

const PAGE_SIZE = 100;

export const IncidentsLoader = Loader.collection({
  name: "datadog-incidents:root:incidents",
  context: DatadogIncidentsContext,
  entity: DatadogIncidentsRoot,
  target: DatadogIncident,

  async load(_ref, page, env) {
    const offset = page.parseAsNumericOffset(0);

    const result = await env.ops.execute(ListIncidents, {
      pageSize: PAGE_SIZE,
      pageOffset: offset,
    });

    const items = result.data.map((incident) => {
      const attrs = incident.attributes;

      return EntityInput.create(DatadogIncident.ref(incident.id), {
        incidentId: incident.id,
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

    const nextOffset = offset + PAGE_SIZE;
    return Page.from(items, result.hasMore, String(nextOffset));
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogIncidentsRootResolver = Resolver.for(DatadogIncidentsRoot, {
  site: RootBasicLoader.field("site"),
  incidents: IncidentsLoader.field(),
});
