/**
 * LinearUser Resolver — Loads user details.
 */

import {
  Loader,
  Resolver,
  EntityInput,
  type LoaderName,
} from "@max/core";
import { LinearUser } from "../entities.js";
import { LinearContext } from "../context.js";
import { GetUser } from "../operations.js";

// ============================================================================
// Loaders
// ============================================================================

export const UserBasicLoader = Loader.entity({
  name: "linear:user:basic",
  context: LinearContext,
  entity: LinearUser,
  strategy: "autoload",

  async load(ref, env) {
    const data = await env.ops.execute(GetUser, { id: ref.id });
    const u = data.user;
    return EntityInput.create(ref, {
      name: u.name,
      email: u.email,
      displayName: u.displayName,
      active: u.active,
      admin: u.admin,
    });
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const LinearUserResolver = Resolver.for(LinearUser, {
  name: UserBasicLoader.field("name"),
  email: UserBasicLoader.field("email"),
  displayName: UserBasicLoader.field("displayName"),
  active: UserBasicLoader.field("active"),
  admin: UserBasicLoader.field("admin"),
});
