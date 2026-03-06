/**
 * DatadogIncidentTodo Resolver — Autoload fallback for todos.
 *
 * In practice, fields are populated eagerly by TodosLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { DatadogIncidentTodo } from "../entities.js";
import { DatadogIncidentsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const TodoBasicLoader = Loader.entity({
  name: "datadog-incidents:todo:basic",
  context: DatadogIncidentsContext,
  entity: DatadogIncidentTodo,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const DatadogIncidentTodoResolver = Resolver.for(DatadogIncidentTodo, {
  todoId: TodoBasicLoader.field("todoId"),
  incidentId: TodoBasicLoader.field("incidentId"),
  content: TodoBasicLoader.field("content"),
  completed: TodoBasicLoader.field("completed"),
  dueDate: TodoBasicLoader.field("dueDate"),
  created: TodoBasicLoader.field("created"),
  modified: TodoBasicLoader.field("modified"),
});
