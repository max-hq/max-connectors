/**
 * Datadog Incidents entity definitions.
 *
 * Ordered leaf-first to avoid forward references in const declarations.
 */

import {
  EntityDef,
  Field,
  type ScalarField,
  type RefField,
  type CollectionField,
} from "@max/core";

// ============================================================================
// DatadogIncidentTodo (leaf — one todo item for an incident)
// ============================================================================

export interface DatadogIncidentTodo extends EntityDef<{
  todoId: ScalarField<"string">;
  incident: RefField<DatadogIncident>;
  content: ScalarField<"string">;
  completed: ScalarField<"string">;
  dueDate: ScalarField<"string">;
  created: ScalarField<"string">;
  modified: ScalarField<"string">;
}> {}

export const DatadogIncidentTodo: DatadogIncidentTodo = EntityDef.create("DatadogIncidentTodo", {
  todoId: Field.string(),
  incident: Field.refThunk(() => DatadogIncident),
  content: Field.string(),
  completed: Field.string(),
  dueDate: Field.string(),
  created: Field.string(),
  modified: Field.string(),
});

// ============================================================================
// DatadogIncident (one incident — owns a collection of todos)
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
  todos: CollectionField<DatadogIncidentTodo>;
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
  todos: Field.collection(DatadogIncidentTodo),
});

// ============================================================================
// DatadogIncidentsRoot (root singleton)
// ============================================================================

export interface DatadogIncidentsRoot extends EntityDef<{
  site: ScalarField<"string">;
  incidents: CollectionField<DatadogIncident>;
}> {}

export const DatadogIncidentsRoot: DatadogIncidentsRoot = EntityDef.create("DatadogIncidentsRoot", {
  site: Field.string(),
  incidents: Field.collection(DatadogIncident),
});
