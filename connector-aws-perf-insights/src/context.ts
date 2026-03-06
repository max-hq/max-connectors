/**
 * AWSPerfInsightsContext - Context definition for the AWS Performance Insights connector.
 */

import { Context } from "@max/core";
import type { PIClient } from "./pi-client.js";

export class AWSPerfInsightsContext extends Context {
  api = Context.instance<PIClient>();
}
