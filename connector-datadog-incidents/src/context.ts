/**
 * DatadogIncidentsContext - Context definition for the Datadog Incidents connector.
 */

import { Context } from "@max/core";
import type { DatadogClient } from "./datadog-client.js";

export class DatadogIncidentsContext extends Context {
  api = Context.instance<DatadogClient>();
}
