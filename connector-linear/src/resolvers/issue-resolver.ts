/**
 * LinearIssue Resolver — Loads issue details including state, assignee, and project.
 *
 * In practice, most issue fields are populated eagerly by TeamIssuesLoader
 * and ProjectIssuesLoader. This entity loader serves as a fallback for
 * autoload and any issues not yet populated.
 */

import {
  Loader,
  Resolver,
  EntityInput,
  type LoaderName,
} from "@max/core";
import { LinearIssue, LinearUser, LinearProject } from "../entities.js";
import { LinearContext } from "../context.js";
import { GetIssue } from "../operations.js";

// ============================================================================
// Loaders
// ============================================================================

export const IssueBasicLoader = Loader.entity({
  name: "linear:issue:basic",
  context: LinearContext,
  entity: LinearIssue,
  strategy: "autoload",

  async load(ref, env) {
    const data = await env.ops.execute(GetIssue, { id: ref.id });
    const i = data.issue;
    return EntityInput.create(ref, {
      identifier: i.identifier,
      title: i.title,
      description: i.description ?? undefined,
      priority: i.priority,
      state: i.state?.name ?? undefined,
      assignee: i.assignee ? LinearUser.ref(i.assignee.id) : undefined,
      project: i.project ? LinearProject.ref(i.project.id) : undefined,
    });
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const LinearIssueResolver = Resolver.for(LinearIssue, {
  identifier: IssueBasicLoader.field("identifier"),
  title: IssueBasicLoader.field("title"),
  description: IssueBasicLoader.field("description"),
  priority: IssueBasicLoader.field("priority"),
  state: IssueBasicLoader.field("state"),
  assignee: IssueBasicLoader.field("assignee"),
  project: IssueBasicLoader.field("project"),
});
