/**
 * DatadogIncident Resolver — Autoload fallback for incidents.
 *
 * In practice, fields are populated eagerly by IncidentsLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { DatadogIncident } from "../entities.js";
import { DatadogIncidentsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const IncidentBasicLoader = Loader.entity({
  name: "datadog-incidents:incident:basic",
  context: DatadogIncidentsContext,
  entity: DatadogIncident,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
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
});
