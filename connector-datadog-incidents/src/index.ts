/**
 * @max/connector-datadog-incidents - Datadog Incidents connector.
 *
 * Syncs incident data, severity, response times, and associated
 * action items (todos) from Datadog.
 */

import { Context } from "@max/core";
import { ConnectorDef, ConnectorModule, Installation } from "@max/connector";
import { DatadogIncidentsSchema } from "./schema.js";
import { DatadogIncidentsSeeder } from "./seeder.js";
import { DatadogIncidentsRootResolver } from "./resolvers/root-resolver.js";
import { DatadogIncidentResolver } from "./resolvers/incident-resolver.js";
import { DatadogIncidentTodoResolver } from "./resolvers/todo-resolver.js";
import { DatadogIncidentsOnboarding } from "./onboarding.js";
import { DatadogIncidentsContext } from "./context.js";
import { DatadogClient } from "./datadog-client.js";
import { DatadogApiKey, DatadogAppKey } from "./credentials.js";
import type { DatadogIncidentsConfig } from "./config.js";

// ============================================================================
// ConnectorDef
// ============================================================================

const DatadogIncidentsDef = ConnectorDef.create<DatadogIncidentsConfig>({
  name: "datadog-incidents",
  displayName: "Datadog Incidents",
  description: "Datadog Incidents connector - syncs incident data, severity, response times, and action items (todos)",
  icon: "",
  version: "0.1.0",
  scopes: [],
  schema: DatadogIncidentsSchema,
  onboarding: DatadogIncidentsOnboarding,
  seeder: DatadogIncidentsSeeder,
  resolvers: [
    DatadogIncidentsRootResolver,
    DatadogIncidentResolver,
    DatadogIncidentTodoResolver,
  ],
});

// ============================================================================
// ConnectorModule (default export)
// ============================================================================

const DatadogIncidentsConnector = ConnectorModule.create<DatadogIncidentsConfig>({
  def: DatadogIncidentsDef,
  initialise(config, credentials) {
    const apiKeyHandle = credentials.get(DatadogApiKey);
    const appKeyHandle = credentials.get(DatadogAppKey);
    const api = new DatadogClient(apiKeyHandle, appKeyHandle, config.site);

    const ctx = Context.build(DatadogIncidentsContext, { api });

    return Installation.create({
      context: ctx,
      async start() {
        await api.start();
        credentials.startRefreshSchedulers();
      },
      async stop() {
        credentials.stopRefreshSchedulers();
      },
      async health() {
        const result = await api.health();
        return result.ok
          ? { status: "healthy" }
          : { status: "unhealthy", reason: result.error ?? "Unknown error" };
      },
    });
  },
});

export default DatadogIncidentsConnector;
