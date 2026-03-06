/**
 * DatadogMetricsContext - Context definition for the Datadog Metrics connector.
 */

import { Context } from "@max/core";
import type { DatadogClient } from "./datadog-client.js";

export class DatadogMetricsContext extends Context {
  api = Context.instance<DatadogClient>();
}
