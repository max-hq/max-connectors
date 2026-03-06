/**
 * AWSCostExplorerContext - Context definition for the AWS Cost Explorer connector.
 */

import { Context } from "@max/core";
import type { CostExplorerClient } from "./cost-explorer-client.js";

export class AWSCostExplorerContext extends Context {
  api = Context.instance<CostExplorerClient>();
}
