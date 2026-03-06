/**
 * AWSAccount Resolver — Autoload fallback for organization account records.
 *
 * Fields are populated eagerly by AccountsLoader during collection loading.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSAccount } from "../entities.js";
import { AWSCostExplorerContext } from "../context.js";

export const AccountBasicLoader = Loader.entity({
  name: "aws-cost-explorer:account:basic",
  context: AWSCostExplorerContext,
  entity: AWSAccount,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

export const AWSAccountResolver = Resolver.for(AWSAccount, {
  accountId: AccountBasicLoader.field("accountId"),
  accountName: AccountBasicLoader.field("accountName"),
  email: AccountBasicLoader.field("email"),
  status: AccountBasicLoader.field("status"),
  joinedDate: AccountBasicLoader.field("joinedDate"),
});
