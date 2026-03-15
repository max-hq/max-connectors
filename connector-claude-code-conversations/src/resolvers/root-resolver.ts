/**
 * Root Resolver — Discovers projects from the root entry point.
 */

import {
  Loader,
  Resolver,
  EntityInput,
  Page,
  type LoaderName,
} from "@max/core";
import { Root, Project } from "../entities.js";
import { CCConversationsContext } from "../context.js";
import { ListProjects } from "../operations.js";

// ============================================================================
// Loaders
// ============================================================================

export const RootProjectsLoader = Loader.collection({
  name: "conversations:root:projects",
  context: CCConversationsContext,
  entity: Root,
  target: Project,

  async load(_ref, _page, env) {
    const projectDirs = await env.ops.execute(ListProjects, {});
    const items = projectDirs.map((dir) =>
      EntityInput.create(Project.ref(dir), {}),
    );
    return Page.from(items, false, undefined);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const RootResolver = Resolver.for(Root, {
  projects: RootProjectsLoader.field(),
});
