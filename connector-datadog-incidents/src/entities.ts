/**
 * Datadog Incidents entity definitions.
 *
 * Ordered leaf-first to avoid forward references in const declarations.
 */

import {
  EntityDef,
  Field,
  type ScalarField,
  type CollectionField,
} from "@max/core";

// ============================================================================
// DatadogIncident (leaf — one incident)
// ============================================================================

export interface DatadogIncident extends EntityDef<{
  incidentId: ScalarField<"string">;
  publicId: ScalarField<"number">;
  title: ScalarField<"string">;
  severity: ScalarField<"string">;
  state: ScalarField<"string">;
  customerImpacted: ScalarField<"string">;
  customerImpactScope: ScalarField<"string">;
  customerImpactDuration: ScalarField<"number">;
  created: ScalarField<"string">;
  modified: ScalarField<"string">;
  detected: ScalarField<"string">;
  resolved: ScalarField<"string">;
  timeToDetect: ScalarField<"number">;
  timeToRepair: ScalarField<"number">;
  timeToResolve: ScalarField<"number">;
  visibility: ScalarField<"string">;
}> {}

export const DatadogIncident: DatadogIncident = EntityDef.create("DatadogIncident", {
  incidentId: Field.string(),
  publicId: Field.number(),
  title: Field.string(),
  severity: Field.string(),
  state: Field.string(),
  customerImpacted: Field.string(),
  customerImpactScope: Field.string(),
  customerImpactDuration: Field.number(),
  created: Field.string(),
  modified: Field.string(),
  detected: Field.string(),
  resolved: Field.string(),
  timeToDetect: Field.number(),
  timeToRepair: Field.number(),
  timeToResolve: Field.number(),
  visibility: Field.string(),
});

// ============================================================================
// DatadogIncidentTodo (leaf — one todo item for an incident)
// ============================================================================

export interface DatadogIncidentTodo extends EntityDef<{
  todoId: ScalarField<"string">;
  incidentId: ScalarField<"string">;
  content: ScalarField<"string">;
  completed: ScalarField<"string">;
  dueDate: ScalarField<"string">;
  created: ScalarField<"string">;
  modified: ScalarField<"string">;
}> {}

export const DatadogIncidentTodo: DatadogIncidentTodo = EntityDef.create("DatadogIncidentTodo", {
  todoId: Field.string(),
  incidentId: Field.string(),
  content: Field.string(),
  completed: Field.string(),
  dueDate: Field.string(),
  created: Field.string(),
  modified: Field.string(),
});

// ============================================================================
// DatadogIncidentsRoot (root singleton — all collections)
// ============================================================================

export interface DatadogIncidentsRoot extends EntityDef<{
  site: ScalarField<"string">;
  incidents: CollectionField<DatadogIncident>;
  todos: CollectionField<DatadogIncidentTodo>;
}> {}

export const DatadogIncidentsRoot: DatadogIncidentsRoot = EntityDef.create("DatadogIncidentsRoot", {
  site: Field.string(),
  incidents: Field.collection(DatadogIncident),
  todos: Field.collection(DatadogIncidentTodo),
});
