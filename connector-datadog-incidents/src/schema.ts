/**
 * Datadog Incidents connector schema.
 */

import { Schema } from "@max/core";
import {
  DatadogIncident,
  DatadogIncidentTodo,
  DatadogIncidentsRoot,
} from "./entities.js";

export {
  DatadogIncident,
  DatadogIncidentTodo,
  DatadogIncidentsRoot,
};

export const DatadogIncidentsSchema = Schema.create({
  namespace: "datadog-incidents",
  entities: [
    DatadogIncident,
    DatadogIncidentTodo,
    DatadogIncidentsRoot,
  ],
  roots: [DatadogIncidentsRoot],
});
